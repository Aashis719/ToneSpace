import React, { useEffect, useState } from 'react';

export const LoadingScreen: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFading(true);
            setTimeout(() => setIsVisible(false), 1000);
        }, 2200);

        return () => clearTimeout(timer); 
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-col items-center space-y-8">
                {/* Minimalist Pulse Indicator */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-black/10 animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-black/60" />
                </div> 

                {/* Branding */}
                <div className="text-center overflow-hidden">
                    <h1 className="text-2xl md:text-3xl font-light tracking-[0.4em] uppercase text-black/90 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                        Tone<span className="font-bold">Space</span>
                    </h1>
                </div>

                {/* Status */}
                <div className="h-4">
                    <p className="text-[9px] tracking-[0.6em] uppercase text-black/20 font-bold ml-1">
                        Reflecting
                    </p>
                </div>
            </div>
        </div>
    );
};
