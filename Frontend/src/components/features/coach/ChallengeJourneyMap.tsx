"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainingStage } from "@/data/curriculum";

interface Props {
    stages: TrainingStage[];
    currentDay: number; // 1 to N
    unlockMode?: "all" | "progressive";
    onDayClick: (stage: TrainingStage) => void;
}

export function ChallengeJourneyMap({ stages, currentDay, unlockMode = "progressive", onDayClick }: Props) {
    return (
        <div className="relative py-12 flex flex-col items-center">
            {/* 1. Cinematic Connector Line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 pointer-events-none opacity-20">
                <div className="h-full w-full bg-gradient-to-b from-brand-lime via-emerald-400 to-brand-lime/0 rounded-full blur-[0.5px]" />
            </div>

            <div className="space-y-12 relative z-10 w-full">
                {stages.map((stage, idx) => {
                    const isProgressiveMode = unlockMode === "progressive";
                    const isCompleted = isProgressiveMode && stage.day < currentDay;
                    const isCurrent = isProgressiveMode ? stage.day === currentDay : stage.day === 1;
                    const isLocked = isProgressiveMode && stage.day > currentDay;
                    const activeAltId = stage.steps.reduce((acc: string | null, s: any) => s.activeAlternativeId || acc, null);

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: idx * 0.05, type: "spring", damping: 12 }}
                            onClick={() => !isLocked && onDayClick(stage)}
                            className={cn(
                                "flex items-center gap-6 relative group/node max-w-sm mx-auto",
                                idx % 2 === 0 ? "flex-row text-left" : "flex-row-reverse text-right"
                            )}
                        >
                            {/* Card Panel */}
                            <div className={cn(
                                "flex-1 glass p-5 rounded-[2rem] border transition-all duration-500 shadow-sm",
                                isCurrent
                                    ? "bg-white border-brand-lime ring-4 ring-brand-lime/10 shadow-lg scale-105 z-20"
                                    : isCompleted
                                        ? "border-white/60 hover:border-brand-lime/40 cursor-pointer"
                                        : "opacity-40 grayscale border-white/20 cursor-not-allowed"
                            )}>
                                <div className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] mb-1.5",
                                    isCurrent ? "text-brand-lime" : "text-gray-400"
                                )}>
                                    Day {stage.day}
                                </div>
                                <div className="font-black text-slate-800 text-base leading-tight">
                                    {stage.title}
                                    {activeAltId && (
                                        <span className="ml-2 inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-purple-100 uppercase">
                                            Plan {activeAltId}
                                        </span>
                                    )}
                                </div>
                                {isCurrent && (
                                    <div className="mt-3 flex items-center justify-start gap-2">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-1.5 h-1.5 rounded-full bg-brand-lime"
                                        />
                                        <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Active Level</span>
                                    </div>
                                )}
                            </div>

                            {/* Center Node Button */}
                            <div className="relative shrink-0">
                                {isCurrent && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 1 }}
                                        transition={{ repeat: Infinity, duration: 3, repeatType: "mirror" }}
                                        className="absolute inset-0 bg-brand-lime/20 rounded-2xl blur-xl"
                                    />
                                )}

                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg relative z-10",
                                    isCurrent
                                        ? "bg-brand-lime text-slate-800 border-white/40 scale-110 shadow-brand-lime/30"
                                        : isCompleted
                                            ? "bg-white text-brand-lime border-brand-lime/20"
                                            : isLocked
                                                ? "bg-white/40 backdrop-blur-md text-gray-300 border-white/60"
                                                : "bg-white text-brand-lime border-brand-lime/20"
                                )}>
                                    {isCompleted ? (
                                        <Check className="w-8 h-8 stroke-[3]" />
                                    ) : (
                                        <stage.icon className={cn("w-8 h-8", isCurrent ? "animate-pulse" : "")} />
                                    )}

                                    {isLocked && (
                                        <div className="absolute -top-2 -right-2 bg-white rounded-lg p-1.5 border border-gray-100 shadow-sm">
                                            <Lock className="w-3 h-3 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Invisible spacer to maintain layout */}
                            <div className="flex-1 hidden sm:block" />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
