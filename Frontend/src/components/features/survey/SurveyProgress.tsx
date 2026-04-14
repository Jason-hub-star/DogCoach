"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animations/AnimatedCounter";

interface Props {
    currentStep: number;
    totalSteps: number;
}

export function SurveyProgress({ currentStep, totalSteps }: Props) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full max-w-md mx-auto mb-8 px-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-3 uppercase tracking-[0.15em] font-outfit">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
                    Progress
                </span>
                <span className="text-brand-dark">
                    <AnimatedCounter value={progress} />%
                </span>
            </div>
            <div className="h-2.5 bg-white shadow-inner rounded-full overflow-hidden border border-gray-100 p-[2px]">
                <motion.div
                    className="h-full bg-gradient-to-r from-brand-lime to-green-400 rounded-full shadow-glow-lime-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                />
            </div>
        </div>
    );
}
