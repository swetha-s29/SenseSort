import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/10 bg-black/20 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm">
                    Powered by YOLOv8 & Dual-Brain AI Logic
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Privacy Policy</span>
                    <span>•</span>
                    <span>Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
