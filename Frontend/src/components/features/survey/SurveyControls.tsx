"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DESIGN_COLORS, EFFECT_COLORS } from "@/lib/theme/colors";

interface Props {
    step: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    canNext: boolean;
}

export function SurveyControls({ step, totalSteps, onNext, onBack, canNext }: Props) {
    return (
        <div className="w-full mt-2 md:mt-4">
            <div className="flex items-center justify-between gap-4">
                <motion.button
                    onClick={onBack}
                    disabled={step === 1}
                    whileHover={step === 1 ? {} : { scale: 1.1, backgroundColor: DESIGN_COLORS.gray50 }}
                    whileTap={step === 1 ? {} : { scale: 0.9 }}
                    className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 text-gray-600 transition-all",
                        step === 1 ? "opacity-30 cursor-not-allowed" : "shadow-sm hover:border-gray-300"
                    )}
                >
                    <ChevronLeft className="w-6 h-6" />
                </motion.button>

                <motion.button
                    onClick={onNext}
                    disabled={!canNext}
                    whileHover={canNext ? { scale: 1.02, boxShadow: EFFECT_COLORS.controlHoverShadow } : {}}
                    whileTap={canNext ? { scale: 0.98 } : {}}
                    animate={!canNext ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                    transition={!canNext ? {
                        duration: 0.4,
                        repeat: 0
                    } : {
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                    }}
                    className={cn(
                        "flex-1 h-14 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all font-outfit text-lg tracking-tight",
                        canNext
                            ? "bg-brand-lime shadow-xl shadow-brand-lime/20"
                            : "bg-gray-200 cursor-not-allowed text-gray-400"
                    )}
                >
                    {step === totalSteps ? "심층 분석 시작하기" : "다음 단계로"}
                    <ArrowRight className={cn(
                        "w-5 h-5 transition-transform duration-300",
                        canNext && "group-hover:translate-x-1"
                    )} />
                </motion.button>
            </div>
        </div>
    );
}
