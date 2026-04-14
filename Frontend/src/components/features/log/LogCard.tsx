"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, MoreHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LogData {
    id: string;
    time: string;
    location: string;
    intensity: number; // 1-10
    duration: string; // e.g., "5분"
    antecedent: string; // A: 원인
    behavior: string; // B: 행동
    consequence: string; // C: 반응
    tags: string[];
    aiComment?: string;
}

interface Props {
    log: LogData;
}

export function LogCard({ log }: Props) {
    // Intensity Logic with Premium Hues
    const getIntensityColor = (level: number) => {
        if (level <= 3) return "bg-emerald-400";
        if (level <= 7) return "bg-brand-orange";
        return "bg-rose-500";
    };

    const getIntensityBg = (level: number) => {
        if (level <= 3) return "bg-emerald-500/10";
        if (level <= 7) return "bg-brand-orange/10";
        return "bg-rose-500/10";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass p-6 rounded-[2.5rem] shadow-elev-base border border-white/60 relative overflow-hidden group ring-1 ring-black/5"
        >
            {/* Header: Time & Intensity */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/40 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/60 group-hover:bg-brand-lime/10 transition-all duration-500">
                        {log.behavior.includes("짖음") || log.behavior.includes("Barking") ? "🔊" : "📝"}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">행동 기록</div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-brand-lime" />
                            <span className="text-sm font-black text-slate-800">{log.time}</span>
                            <span className="text-gray-300 mx-1">|</span>
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-black text-gray-400 uppercase tracking-tight">
                                {log.location.includes(' (')
                                    ? log.location.split(' (').map((part, i) => i === 0 ? part : <span key={i}><br />({part}</span>)
                                    : log.location}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={cn("px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-black/5 ring-1 ring-inset ring-white/20 whitespace-nowrap", getIntensityColor(log.intensity))}>
                    강도 {log.intensity}
                </div>
            </div>

            {/* Body: ABC Flow with Cinematic Path */}
            <div className="space-y-6 relative ml-2">
                <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-lime/40 via-gray-100 to-gray-50 -z-0" />

                <ABCStep
                    char="A"
                    title={log.antecedent}
                    label="선행자극"
                    desc="원인 및 상황"
                    color="bg-blue-500"
                />

                <ABCStep
                    char="B"
                    title={log.behavior}
                    label="문제 행동"
                    desc={`${log.duration} 동안 지속`}
                    active
                    intensityBg={getIntensityBg(log.intensity)}
                    intensityColor={getIntensityColor(log.intensity)}
                />

                <ABCStep
                    char="C"
                    title={log.consequence}
                    label="반응·결과"
                    desc="보호자의 대처"
                    color="bg-purple-500"
                />
            </div>

            {/* AI Coaching Insight */}
            {log.aiComment && (
                <div className="mt-8 pt-6 border-t border-gray-100/50">
                    <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/60 flex gap-4 relative overflow-hidden group/insight">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover/insight:scale-125 transition-transform duration-700">
                            <Sparkles className="w-12 h-12 text-brand-lime" />
                        </div>
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-lime/10 flex items-center justify-center border border-brand-lime/20">
                            <Sparkles className="w-5 h-5 text-brand-lime" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em] mb-1">TailLog 코치</div>
                            <p className="text-xs font-bold text-gray-700 leading-relaxed break-keep">
                                {log.aiComment}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function ABCStep({ char, title, label, desc, active, color, intensityBg, intensityColor }: any) {
    return (
        <div className="flex items-start gap-5 group/step">
            <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 z-10 ring-4 ring-white shadow-sm transition-all duration-300 group-hover/step:scale-110",
                active ? intensityColor : (color || "bg-gray-200")
            )}>
                {char}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">{label}</span>
                </div>
                <div className="text-base font-black text-slate-800 tracking-tight leading-snug">{title}</div>
                <div className="text-[10px] font-bold text-gray-400 opacity-80">{desc}</div>
            </div>
        </div>
    );
}
