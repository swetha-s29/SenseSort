import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Demo from './components/Demo'
import HowItWorks from './components/HowItWorks'
import LiveScanner from './components/LiveScanner'
import Footer from './components/Footer'
import { Image, Camera, AlertTriangle, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

function App() {
    // Mode 'upload' (Core Detection) is default
    // Mode 'report' (Civic Reporting) is separate flow
    const [mode, setMode] = useState('upload');

    return (
        <div className="min-h-screen bg-background text-white selection:bg-emerald-500/30">
            <Navbar />
            <main className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20">
                <Hero />
                <HowItWorks />

                {/* Main Interactive Section */}
                <div id="demo" className="w-full flex flex-col items-center gap-8 -mt-10">
                    <div className="flex flex-col items-center gap-6 max-w-2xl text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Select Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> Action</span>
                        </h2>

                        {/* Two Distinct Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            {/* 1. Core Detection Button */}
                            <button
                                onClick={() => setMode('upload')}
                                className={clsx(
                                    "flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 border-2",
                                    mode === 'upload'
                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                                        : "bg-slate-800 border-slate-700 text-gray-300 hover:border-emerald-500 hover:text-white"
                                )}
                            >
                                <Image className="w-5 h-5" />
                                <div>
                                    <span className="block text-sm font-normal opacity-80 text-left">For Individuals</span>
                                    Analyze Waste
                                </div>
                            </button>

                            {/* 2. Civic Reporting Button */}
                            <button
                                onClick={() => setMode('report')}
                                className={clsx(
                                    "flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 border-2 group",
                                    mode === 'report'
                                        ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                                        : "bg-slate-800 border-slate-700 text-gray-300 hover:border-amber-500 hover:text-white"
                                )}
                            >
                                <div className="p-1 bg-amber-500/20 rounded-full group-hover:bg-amber-500/40 transition-colors">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <span className="block text-sm font-normal opacity-80 text-left">For Local Authorities</span>
                                    Report Incident
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {mode === 'upload' ? (
                            /* Core Flow */
                            <div className="space-y-4">
                                <Demo />
                            </div>
                        ) : (
                            /* Reporting Flow */
                            <div className="relative">
                                {/* Back Button helper for Flow */}
                                <button
                                    onClick={() => setMode('upload')}
                                    className="absolute -top-12 left-0 text-sm text-gray-400 hover:text-white flex items-center gap-1"
                                >
                                    &larr; Back to Simple Analysis
                                </button>
                                <LiveScanner />
                            </div>
                        )}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    )
}

export default App
