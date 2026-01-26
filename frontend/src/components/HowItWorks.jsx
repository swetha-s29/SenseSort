import React from 'react';
import { motion } from 'framer-motion';
import { Scan, BrainCircuit, Recycle } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: <Scan className="w-8 h-8 text-emerald-400" />,
            title: "1. Upload Image",
            description: "Take a photo or upload an image of your waste item."
        },
        {
            icon: <BrainCircuit className="w-8 h-8 text-blue-400" />,
            title: "2. AI Analysis",
            description: "Our Dual-Brain AI detects the object and checks for contamination."
        },
        {
            icon: <Recycle className="w-8 h-8 text-green-400" />,
            title: "3. Get Result",
            description: "Receive instant sorting advice: Recyclable, Compostable, or General Waste."
        }
    ];

    return (
        <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold mb-4"
                >
                    How <span className="text-emerald-400">SenseSort</span> Works
                </motion.h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    We use advanced computer vision to ensure your waste ends up in the right place.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="p-4 rounded-full bg-white/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
