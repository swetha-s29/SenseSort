from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from ultralytics import YOLO
import threading
import os
import cv2
import numpy as np

app = Flask(__name__, template_folder='templates')
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

# Load Models (Lazy loading or global)
print("Loading AI Models... This may take a while.")
try:
    model_det = YOLO('yolov8x.pt')
    model_cls = YOLO('yolov8x-cls.pt')
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    # In a real scenario, we might want to exit or handle this gracefully
    model_det = None
    model_cls = None

def check_contamination(image):
    """
    Check for contamination using HSV Saturation.
    Returns: Condition ('Contaminated' or 'Clean'), Contamination Value (0-100)
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    avg_saturation = np.mean(s)
    
    # Using the heuristic S > 80 (approx 31%) as per original request
    is_contaminated = avg_saturation > 80
    return "Contaminated" if is_contaminated else "Clean", avg_saturation

def categorize_waste(label, is_contaminated):
    """
    Apply waste categorization rules.
    """
    label_lower = label.lower()
    
    # Defaults
    recommendation = "General Waste (Black Bin)"
    recyclable = False
    biodegradable = False
    reasoning = f"Identified {label}."

    # Logic
    if any(x in label_lower for x in ['plastic', 'bottle', 'container']):
        if is_contaminated:
            recommendation = "General Waste (Black Bin)"
            reasoning = f"Identified {label} but it is contaminated."
            recyclable = False
        else:
            recommendation = "Recyclable (Blue Bin)"
            recyclable = True
            reasoning = f"Identified {label}, which is recyclable."
            
    elif any(x in label_lower for x in ['glass', 'metal', 'can', 'tin', 'jar', 'aluminum']):
        recommendation = "Recyclable (Blue Bin)"
        recyclable = True
        reasoning = f"Identified {label}, which is recyclable glass/metal."
        
    elif any(x in label_lower for x in ['organic', 'fruit', 'vegetable', 'food', 'banana', 'apple', 'orange']):
        recommendation = "Compostable (Green Bin)"
        biodegradable = True
        recyclable = False # Organic is usually not "recyclable" in the dry sense, but compostable.
        reasoning = f"Identified {label}, which is organic and compostable."
        
    elif any(x in label_lower for x in ['paper', 'cardboard', 'carton', 'box']):
        recommendation = "Recyclable (Blue Bin)"
        recyclable = True
        biodegradable = True
        reasoning = f"Identified {label}. Paper is recyclable and biodegradable."
        
    elif any(x in label_lower for x in ['e-waste', 'electronic', 'phone', 'laptop', 'battery']):
        recommendation = "Special Collection (Red Grid)"
        recyclable = True
        reasoning = f"Identified {label}, requires special e-waste handling."
    
    else:
        # Fallback
        pass

    return recommendation, recyclable, biodegradable, reasoning

def get_severity_color(score):
    """
    Map contamination score to a severity color.
    """
    if score > 70:
        return "red"
    elif score > 30:
        return "yellow"
    return "green"

@app.route('/analyze', methods=['POST'])
def analyze():
    mode = request.args.get('mode', 'simple')
    
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
            
        file = request.files['image']
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({'error': 'Invalid image'}), 400

        # --- REPORT MODE (Advanced / Civic) ---
        if mode == 'report':
            # 1. Object Detection (YOLO)
            results = model_det(image)
            
            detected_objects = []
            total_contamination = 0
            hazardous_count = 0
            
            if results and len(results[0].boxes) > 0:
                for box in results[0].boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf)
                    cls_id = int(box.cls)
                    label = model_det.names[cls_id]
                    
                    if conf < 0.4: continue

                    h, w, _ = image.shape
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)
                    object_crop = image[y1:y2, x1:x2]

                    # Per-object contamination
                    condition, contam_score = check_contamination(object_crop)
                    total_contamination += contam_score

                    waste_type = "General"
                    if any(x in label.lower() for x in ['plastic', 'glass', 'metal', 'paper', 'cardboard']):
                        waste_type = "Recyclable"
                    elif any(x in label.lower() for x in ['organic', 'food', 'fruit']):
                        waste_type = "Biodegradable"
                    elif any(x in label.lower() for x in ['battery', 'electronic', 'medical']):
                        waste_type = "Hazardous"
                        hazardous_count += 1
                    
                    detected_objects.append({
                        "id": len(detected_objects),
                        "label": label,
                        "confidence": round(conf, 2),
                        "bbox": [x1, y1, x2-x1, y2-y1],
                        "contamination": {
                            "score": round(contam_score, 1),
                            "status": condition,
                            "color": get_severity_color(contam_score)
                        },
                        "type": waste_type
                    })

            obj_count = len(detected_objects)
            avg_contam = (total_contamination / obj_count) if obj_count > 0 else 0
            
            severity_score = (avg_contam * 0.5) + (obj_count * 10) + (hazardous_count * 50)
            
            severity_level = "Low"
            alert_color = "green"
            if severity_score > 70:
                severity_level = "Critical"
                alert_color = "red"
            elif severity_score > 30:
                severity_level = "Moderate"
                alert_color = "yellow"

            return jsonify({
                "objects": detected_objects,
                "analysis": {
                    "object_count": obj_count,
                    "average_contamination": round(avg_contam, 1),
                    "hazardous_items": hazardous_count,
                    "severity": severity_level,
                    "alert_color": alert_color
                },
                "timestamp": "Generated by SenseSort AI"
            })

        # --- SIMPLE MODE (Default / User) ---
        else:
            # 1. Whole Image Contamination
            condition, contam_score = check_contamination(image)
            is_contaminated = (condition == "Contaminated") # Global Threshold check

            # 2. Dual-Brain Logic
            # Detection First
            results_det = model_det(image)
            best_conf = 0
            best_label = "Unknown"
            det_found = False

            if results_det and len(results_det[0].boxes) > 0:
                box = results_det[0].boxes[0]
                best_conf = float(box.conf)
                class_id = int(box.cls)
                best_label = model_det.names[class_id]
                if best_conf >= 0.40:
                    det_found = True

            final_label = best_label
            final_conf = best_conf
            source = "Detection"

            # Classification Fallback
            if not det_found:
                results_cls = model_cls(image)
                if results_cls and hasattr(results_cls[0], 'probs'):
                    top1_index = results_cls[0].probs.top1
                    final_conf = float(results_cls[0].probs.top1conf)
                    if hasattr(results_cls[0], 'names'):
                        final_label = results_cls[0].names[top1_index]
                    else:
                        final_label = f"Class {top1_index}"
                    source = "Classification"

            # 3. Categorization
            recommendation, recyclable, biodegradable, reasoning_text = categorize_waste(final_label, is_contaminated)
            
            accuracy_level = "High" if final_conf > 0.8 else "Medium" if final_conf > 0.5 else "Low"
            
            return jsonify({
                "recommendation": recommendation,
                "accuracy": accuracy_level,
                "condition": condition, # Clean/Moderate/Contaminated
                "recyclable": "Yes" if recyclable else "No",
                "biodegradable": "Yes" if biodegradable else "No",
                "reasoning": f"{reasoning_text} (Source: {source})",
                "details": {
                    "label": final_label,
                    "confidence": round(final_conf, 2),
                    "saturation": round(contam_score, 2)
                }
            })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/submit-report', methods=['POST'])
def submit_report():
    try:
        data = request.json
        
        # Extract Data
        location = data.get('location', 'Unknown Location')
        timestamp = data.get('timestamp', 'Unknown Time')
        severity = data.get('severity', 'UNKNOWN')
        objects = data.get('objects', [])
        
        # Format "SMS" Body
        waste_summary = ", ".join([f"{obj['label']} ({obj['contamination']['status']})" for obj in objects])
        
        sms_body = f"""
[OFFICIAL WASTE COMPLAINT]
TO: +91 7339124126
SEVERITY: {severity}

LOCATION: {location}
TIME: {timestamp}

DETECTED WASTE:
{waste_summary}

STATUS: Action Required.
        """
        
        # --- TWILIO CONFIGURATION (ENTER YOUR KEYS HERE) ---
        # Get these from https://console.twilio.com/
        TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # Replace with your Account SID
        TWILIO_AUTH_TOKEN = "your_auth_token_here"            # Replace with your Auth Token
        TWILIO_PHONE_NUMBER = "+1234567890"                   # Replace with your Twilio Number
        TO_NUMBER = "+917339124126"                           # The Authority Number
        
        # Attempt Real Sending
        status_msg = "simulated"
        if "ACxxx" not in TWILIO_ACCOUNT_SID: # Simple check if user ignored config
            try:
                from twilio.rest import Client
                client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                
                message = client.messages.create(
                    body=sms_body,
                    from_=TWILIO_PHONE_NUMBER,
                    to=TO_NUMBER
                )
                print(f"TWILIO SMS SENT! SID: {message.sid}")
                status_msg = "sent_via_twilio"
            except Exception as twilio_error:
                print(f"Twilio Error: {twilio_error}")
                status_msg = "twilio_failed_reverted_to_sim"
        
        # Simulate Sending (Always do this for logs)
        print("\n" + "="*40)
        print(f"SENDING SMS TO AUTHORITY ({TO_NUMBER})...")
        print(sms_body)
        print(f"Status: {status_msg}")
        print("="*40 + "\n")
        
        return jsonify({"message": "Report submitted successfully", "status": status_msg}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to submit report"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
