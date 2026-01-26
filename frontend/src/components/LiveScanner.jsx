import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, AlertTriangle, CheckCircle, XCircle, RotateCcw, MapPin, Calendar, FileText, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const LiveScanner = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // State
    const [isStreaming, setIsStreaming] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Geolocation State
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState("Fetching location...");

    // Timestamp
    const [timestamp, setTimestamp] = useState(new Date());

    useEffect(() => {
        // Start camera on mount
        if (!capturedImage) {
            startCamera();
        }
        return () => stopStream();
    }, []);

    const startCamera = async () => {
        setCapturedImage(null);
        setResult(null);
        setError(null);
        setTimestamp(new Date());

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsStreaming(true);

            // Fetch Location immediately
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setLocation({ lat: latitude, lng: longitude });
                        fetchAddress(latitude, longitude);
                    },
                    (err) => {
                        console.error("Geo error:", err);
                        setAddress("Location access denied");
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                setAddress("Geolocation not supported");
            }

        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access denied. Please allow permissions.");
        }
    };

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch (e) {
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
    };

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Draw
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Capture
        const dataUrl = canvas.toDataURL('image/jpeg');
        stopStream();
        setCapturedImage(dataUrl);
        setLoading(true);

        // API Call
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append('image', blob);
            // We could send location to backend here if needed also

            try {
                const response = await fetch('http://localhost:5000/analyze?mode=report', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                setResult(data);
            } catch (err) {
                console.error("Analysis failed:", err);
                setError("Analysis failed. Ensure backend is running.");
            } finally {
                setLoading(false);
            }
        }, 'image/jpeg', 0.9);
    };

    const handleRetake = () => {
        startCamera();
    };

    // Helper for BBox Scaling
    const getScaledBox = (bbox, containerWidth, containerHeight, videoWidth, videoHeight) => {
        if (!videoWidth || !videoHeight) return {};
        const [x, y, w, h] = bbox;
        const scaleX = containerWidth / videoWidth;
        const scaleY = containerHeight / videoHeight;

        // object-fit: cover adjustment logic if needed, but for now assuming direct mapping 
        // or object-contain which matches aspects if we layout correctly.
        // Simplified for 'object-contain' where dimensions match displayed image size.
        return {
            left: `${(x / videoWidth) * 100}%`,
            top: `${(y / videoHeight) * 100}%`,
            width: `${(w / videoWidth) * 100}%`,
            height: `${(h / videoHeight) * 100}%`
        };
    };

    const [submitting, setSubmitting] = useState(false);
    const [reportSent, setReportSent] = useState(false);

    const handleSubmit = async () => {
        if (!result) return;
        setSubmitting(true);

        try {
            const payload = {
                location: address,
                timestamp: format(timestamp, 'PPP p'),
                severity: result.analysis.severity,
                objects: result.objects
            };

            const response = await fetch('http://localhost:5000/submit-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setReportSent(true);
            } else {
                alert("Failed to send report. Please try again.");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Network Error: Could not reach server.");
        } finally {
            setSubmitting(false);
        }
    };

    if (reportSent) {
        // Dynamic Response Time based on Severity
        const getResponseTime = (sev) => {
            if (sev === 'Critical') return '4 Hours';
            if (sev === 'Moderate') return '24 Hours';
            return '72 Hours';
        };

        const responseTime = getResponseTime(result?.analysis?.severity);
        const refId = `CMP-${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}`;

        return (
            <div className="w-full max-w-md mx-auto px-4 py-20 flex items-center justify-center animate-in zoom-in duration-500">
                <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-sans">

                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <FileText className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">Complaint Filed</h2>
                                <p className="text-xs text-gray-400 font-mono mt-1">REF: {refId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Severity */}
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Severity</p>
                                <p className={clsx("text-lg font-bold",
                                    result?.analysis?.severity === 'Critical' ? 'text-red-500' :
                                        result?.analysis?.severity === 'Moderate' ? 'text-yellow-500' : 'text-emerald-500'
                                )}>
                                    {result?.analysis?.severity || "Low"}
                                </p>
                            </div>

                            {/* Response Time */}
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Response Time</p>
                                <p className="text-lg font-bold text-white">{responseTime}</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Location</p>
                            <p className="text-sm font-bold text-white leading-snug break-words">
                                {address.split(',')[0]} {/* Show primarily the immediate area/street */}
                            </p>
                            <p className="text-xs text-gray-600 truncate mt-1">{address}</p>
                        </div>

                        {/* Assigned To */}
                        <div className="pt-4 border-t border-slate-800/50">
                            <p className="text-xs text-gray-500 font-medium mb-1">Assigned to:</p>
                            <p className="text-sm text-gray-300">Municipal Corporation</p>
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="p-4 bg-slate-950/50 flex items-center justify-between">
                        <p className="text-[10px] text-gray-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Status updates sent via Dashboard
                        </p>

                        <button
                            onClick={() => { setReportSent(false); startCamera(); }}
                            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left: Camera/Image Viewport */}
                <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl min-h-[500px] flex items-center justify-center">

                    {!capturedImage && (
                        /* Live Camera View */
                        <>
                            {isStreaming ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-white text-center">
                                    <Camera className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                    <h3 className="text-xl font-bold">Camera Off</h3>
                                    <button onClick={startCamera} className="mt-4 px-6 py-2 bg-emerald-500 rounded-full font-bold">Turn On</button>
                                </div>
                            )}

                            {/* Overlay UI */}
                            {isStreaming && (
                                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-b from-black/60 via-transparent to-black/80">
                                    {/* Top: Location Badge */}
                                    <div className="self-start bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white">
                                        <MapPin className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-mono max-w-[200px] truncate">{address}</span>
                                    </div>

                                    {/* Bottom: Capture Button */}
                                    <div className="self-center">
                                        <button
                                            onClick={captureAndAnalyze}
                                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95 bg-transparent"
                                        >
                                            <div className="w-16 h-16 bg-white rounded-full" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {capturedImage && (
                        /* Captured Image View + Bounding Boxes */
                        <div className="relative w-full h-full">
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />

                            {/* Bounding Boxes */}
                            {!loading && result?.objects?.map((obj) => (
                                <div
                                    key={obj.id}
                                    className="absolute border-2 flex items-start justify-center animate-in zoom-in duration-300"
                                    style={{
                                        ...getScaledBox(obj.bbox, 1, 1, canvasRef.current.width, canvasRef.current.height).style, // Refactored simple style logic below
                                        left: `${(obj.bbox[0] / canvasRef.current.width) * 100}%`,
                                        top: `${(obj.bbox[1] / canvasRef.current.height) * 100}%`,
                                        width: `${(obj.bbox[2] / canvasRef.current.width) * 100}%`,
                                        height: `${(obj.bbox[3] / canvasRef.current.height) * 100}%`,
                                        borderColor: obj.contamination.color
                                    }}
                                >
                                    <span
                                        className="px-1.5 py-0.5 text-[10px] font-bold text-white -mt-5 rounded shadow-sm whitespace-nowrap"
                                        style={{ backgroundColor: obj.contamination.color }}
                                    >
                                        {obj.label}
                                    </span>
                                </div>
                            ))}

                            {/* Controls */}
                            <button
                                onClick={handleRetake}
                                className="absolute top-4 left-4 z-20 px-4 py-2 bg-black/60 text-white rounded-full flex items-center gap-2 hover:bg-black/80 transition-colors backdrop-blur-md"
                            >
                                <RotateCcw className="w-4 h-4" /> Retake
                            </button>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-50">
                            <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
                            <p className="text-white font-mono animate-pulse">Analyzing Geolocation & Severity...</p>
                        </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Right: Analysis Report */}
                <div className="lg:w-[400px] flex flex-col h-full space-y-4">

                    {/* Report Header Card */}
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">Incident Report</h2>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded uppercase">Active</span>
                        </div>

                        <div className="space-y-4">
                            {/* Location */}
                            <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                                <MapPin className="w-5 h-5 text-emerald-500 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Location</p>
                                    <p className="text-sm text-white font-medium break-words leading-tight">{address}</p>
                                    {location && (
                                        <p className="text-[10px] text-gray-500 mt-1 font-mono">
                                            LAT: {location.lat.toFixed(5)}  LONG: {location.lng.toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                                <Calendar className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Time of Incident</p>
                                    <p className="text-sm text-white font-medium">
                                        {format(timestamp, 'PPP p')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Findings */}
                    {!result && (
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl flex-1 flex items-center justify-center text-center">
                            <div className="opacity-50">
                                <p className="text-gray-400 mb-2">Ready to Analyze</p>
                                <p className="text-xs text-gray-500">Capture an image to generate a report.</p>
                            </div>
                        </div>
                    )}

                    {result && result.error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 shadow-xl flex-1 flex flex-col items-center justify-center text-center animate-in fade-in">
                            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-red-400 mb-2">Analysis Failed</h3>
                            <p className="text-sm text-gray-300 mb-6">{result.error}</p>
                            <button
                                onClick={handleRetake}
                                className="px-6 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {result && !result.error && (
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl flex-1 animate-in slide-in-from-bottom duration-500">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                AI Evaluation Result
                            </h3>

                            {/* Severity Alert */}
                            <div
                                className={clsx(
                                    "p-4 rounded-xl border-l-4 mb-6",
                                    result?.analysis?.alert_color === "red" ? "bg-red-500/10 border-red-500" :
                                        result?.analysis?.alert_color === "yellow" ? "bg-yellow-500/10 border-yellow-500" :
                                            "bg-emerald-500/10 border-emerald-500"
                                )}
                            >
                                <p className="text-xs uppercase font-bold opacity-70 mb-1">Severity Level</p>
                                <h2 className={clsx("text-3xl font-bold",
                                    result?.analysis?.alert_color === "red" ? "text-red-500" :
                                        result?.analysis?.alert_color === "yellow" ? "text-yellow-500" : "text-emerald-500"
                                )}>
                                    {result?.analysis?.severity?.toUpperCase()}
                                </h2>
                                <p className="text-xs text-gray-400 mt-2">
                                    Based on {result?.analysis?.object_count} objects with {result?.analysis?.hazardous_items} hazardous items.
                                </p>
                            </div>

                            {/* Detected Objects List */}
                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm font-medium">Detected Items:</p>
                                <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                    {result?.objects?.map(obj => (
                                        <div key={obj.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: obj.contamination.color }} />
                                                <div>
                                                    <p className="font-bold text-white">{obj.label}</p>
                                                    <p className="text-[10px] text-gray-400">{obj.contamination.status} ({obj.contamination.score}%)</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-gray-500">{obj.type}</span>
                                        </div>
                                    ))}
                                    {result?.objects?.length === 0 && (
                                        <p className="text-gray-500 text-sm text-center italic py-4">No waste detected.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Sending...
                                    </>
                                ) : (
                                    "Submit to Authority"
                                )}
                            </button>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LiveScanner;
