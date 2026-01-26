# SenseSort 🌍♻️
> **AI-Powered Waste Segregation & Civic Reporting System**

SenseSort is an intelligent web application designed to bridge the gap between citizens and effective waste management. By leveraging advanced computer vision and geolocation technology, it empowers users to correctly segregate household waste and report public sanitation hazards to authorities in seconds.

## 🎯 Project Overview

Improper waste segregation and unaddressed garbage dumps are major environmental challenges. SenseSort addresses this with a two-pronged approach:
1.  **Educate**: Helping individuals identify recyclable items instantly.
2.  **Act**: providing tools to report large-scale waste violations to the city.

## 🚀 Key Features

### 🔍 1. Core Waste Analysis (For Home Use)
*   **Instant Identification**: Upload any item to know if it goes in the **Recycle**, **Compost**, or **Trash** bin.
*   **Contamination Check**: Uses HSV color analysis to detect dirt/grease on recyclables (e.g., a greasy pizza box is detected as non-recyclable).
*   **Dual-Brain AI**: Runs two models simultaneously—one to find the object, another to understand its material properties.

### 📷 2. Civic Reporting Tool (For Public Issues)
*   **Live Incident Scanner**: A real-time camera interface that scans street corners or dumpsites.
*   **Multi-Object Detection**: Identifies multiple types of waste (bottles, bags, debris) in a single frame.
*   **Severity Assessment**: Automatically calculates a "Hazard Score" based on object count and type (Critical/Moderate/Low).
*   **Official Complaint Generation**: Creates a standardized digital report with:
    *   **Prioritized Response Time** (e.g., 4 Hours for Critical).
    *   **Precise Geolocation** (Address + Lat/Long).
    *   **Contamination Heatmap** (Visualizing the spread of waste).

## 🛠️ Technology Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
*   **Backend**: Python (Flask), Ultralytics YOLOv8, OpenCV, NumPy.
*   **AI Models**: `yolov8x.pt` (Detection) and `yolov8x-cls.pt` (Classification).

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/swetha-s29/SenseSort.git
cd SenseSort
```

### 2. Backend Setup
Navigate to the backend folder and install Python dependencies.
```bash
cd backend
pip install flask flask-cors ultralytics opencv-python numpy
```
*Note: The first time you run the app, it will automatically download the required YOLOv8 model weights (~200MB).*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install Node modules.
```bash
cd frontend
npm install
```

## 🏃‍♂️ How to Run

You need to run the Backend and Frontend simultaneously in two separate terminals.

**Terminal 1 (Backend)**:
```bash
cd backend
python app.py
```
*Server will start at `http://localhost:5000`*

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```
*The application should automatically open in your browser at `http://localhost:5173`*

Built with 💚 for a cleaner future.
