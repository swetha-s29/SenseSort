import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Recycle } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative w-full pt-32 pb-12 flex flex-col items-center text-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-emerald-400 mb-8"
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AI-Powered Waste Analytics
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
            >
                Revolutionizing <br />
                <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Waste Management
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-400 max-w-2xl mb-12"
            >
                Experience real-time segregation with our Dual-Brain AI.
                Instantly analyze plastic, glass, organic, and more.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mb-12"
            >
                <a href="#demo" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
                    Start Analysis <ArrowRight className="w-5 h-5" />
                </a>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-8 justify-center mb-12"
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl filter drop-shadow-2xl">♻️</span>
                    <span className="text-sm text-gray-500 font-medium">Recycle</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl filter drop-shadow-2xl">🌱</span>
                    <span className="text-sm text-gray-500 font-medium">Compost</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl filter drop-shadow-2xl">✨</span>
                    <span className="text-sm text-gray-500 font-medium">Clean</span>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
