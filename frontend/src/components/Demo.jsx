import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle2, XCircle, AlertTriangle, Leaf } from 'lucide-react';
import clsx from 'clsx';

const Demo = () => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const cardStyle = {
        border: '2px solid #4B5563',
        backgroundColor: '#111827',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processImage(file);
        }
    };

    const processImage = async (file) => {
        setImage(URL.createObjectURL(file));
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://localhost:5000/analyze?mode=simple', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error analyzing image:", error);
            alert("Failed to analyze image. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processImage(file);
    };

    return (
        <section className="w-full max-w-6xl mx-auto px-4" id="demo">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Input Region - Spans 1 column on large screens */}
                <div
                    style={cardStyle}
                    className="lg:col-span-1 min-h-[400px] border-dashed border-gray-600 cursor-pointer hover:border-emerald-500/50 transition-colors group relative overflow-hidden"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {image ? (
                        <div className="absolute inset-0 w-full h-full">
                            <img src={image} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="px-4 py-2 bg-black/60 rounded-full text-sm backdrop-blur-md">Click or Drop to Change</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="p-4 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                <Upload className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Upload Waste Image</h3>
                                <p className="text-gray-400 text-sm">Drag & drop or click to browse</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                            <p className="text-emerald-400 font-medium animate-pulse">Analyzing...</p>
                        </div>
                    )}
                </div>

                {/* Results Bento Grid - Spans 2 columns */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* 1. Recommendation (Full Width) */}
                    <div style={{ ...cardStyle }} className="md:col-span-2 flex-row items-center justify-between !py-6 bg-gradient-to-r from-gray-900 to-gray-800">
                        <div>
                            <p className="text-gray-400 text-base font-medium mb-1 uppercase tracking-wider">Recommended Action</p>
                            <h2 className="text-3xl font-bold text-white">
                                {result?.recommendation || "Waiting for Input..."}
                            </h2>
                        </div>
                        <div className="text-5xl animate-bounce-slow">
                            {result?.recommendation.includes("Blue") ? "♻️" :
                                result?.recommendation.includes("Green") ? "🌱" :
                                    result?.recommendation.includes("Red") ? "🔋" :
                                        result?.recommendation.includes("Black") ? "🗑️" : "👋"}
                        </div>
                    </div>

                    {/* 2. Accuracy */}
                    <div style={cardStyle}>
                        <p className="text-gray-400 text-base font-medium mb-2">Confidence</p>
                        <div className="flex items-end gap-2">
                            <span className={clsx(
                                "text-4xl font-bold",
                                result?.accuracy === "High" ? "text-emerald-400" :
                                    result?.accuracy === "Medium" ? "text-yellow-400" : "text-red-400"
                            )}>
                                {result?.accuracy || "--"}
                            </span>
                            <span className="text-sm text-gray-500 mb-2">
                                {result?.details?.confidence ? `${Math.round(result.details.confidence * 100)}%` : ""}
                            </span>
                        </div>
                    </div>

                    {/* 3. Condition */}
                    <div style={cardStyle}>
                        <p className="text-gray-400 text-sm font-medium mb-2">Condition</p>
                        <div className="flex items-center gap-2">
                            <span className={clsx(
                                "text-4xl font-bold",
                                result?.condition === "Clean" ? "text-emerald-400" : "text-amber-500"
                            )}>
                                {result?.condition || "--"}
                            </span>
                            <span className="text-2xl">
                                {result?.condition === "Clean" ? "✨" : result?.condition === "Contaminated" ? "⚠️" : ""}
                            </span>
                        </div>
                    </div>

                    {/* 4. Recyclable */}
                    <div style={cardStyle} className="flex-row items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Recyclable</p>
                            <p className={clsx("text-2xl font-bold mt-1", result?.recyclable === "Yes" ? "text-emerald-400" : "text-gray-500")}>
                                {result?.recyclable || "--"}
                            </p>
                        </div>
                        {result?.recyclable === "Yes" ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <XCircle className="w-8 h-8 text-gray-600" />}
                    </div>

                    {/* 5. Biodegradable */}
                    <div style={cardStyle} className="flex-row items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Biodegradable</p>
                            <p className={clsx("text-2xl font-bold mt-1", result?.biodegradable === "Yes" ? "text-emerald-400" : "text-gray-500")}>
                                {result?.biodegradable || "--"}
                            </p>
                        </div>
                        {result?.biodegradable === "Yes" ? <Leaf className="w-8 h-8 text-emerald-500" /> : <XCircle className="w-8 h-8 text-gray-600" />}
                    </div>

                    {/* 6. AI Reasoning (Full Width) */}
                    <div style={{ ...cardStyle, borderColor: '#7C3AED' }} className="md:col-span-2">
                        <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">AI Analysis</p>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {result?.reasoning || "Upload an image to see the AI analysis logic."}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Demo;
