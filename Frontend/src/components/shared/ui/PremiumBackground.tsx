"use client";

import React from "react";

export const PremiumBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Tech Grid Overlay */}
            <div className="absolute inset-0 tech-grid opacity-40" />

            {/* Organic Blobs */}
            <div className="absolute top-[-6%] left-[-4%] w-[38%] h-[30%] sm:top-[-10%] sm:left-[-10%] sm:w-[50%] sm:h-[50%] bg-brand-lime/10 blur-[72px] sm:blur-[120px] rounded-full animate-blob" />
            <div className="absolute top-[18%] right-[-2%] w-[34%] h-[26%] sm:top-[20%] sm:right-[-5%] sm:w-[40%] sm:h-[40%] bg-brand-orange/5 blur-[64px] sm:blur-[100px] rounded-full animate-blob [animation-delay:2s]" />
            <div className="absolute bottom-[-6%] left-[12%] w-[46%] h-[34%] sm:bottom-[-10%] sm:left-[20%] sm:w-[60%] sm:h-[60%] bg-brand-lime/5 blur-[84px] sm:blur-[140px] rounded-full animate-blob [animation-delay:4s]" />

            {/* Dynamic Scrim */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40 pointer-events-none" />
        </div>
    );
};
