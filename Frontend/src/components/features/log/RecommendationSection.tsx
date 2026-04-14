"use client";

import { useMemo } from "react";
import { TRAINING_CURRICULUM } from "@/data/curriculum";
import { Play, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface RecommendationSectionProps {
    logs: any[];
    dogName: string;
    onStartTraining?: (courseId: string) => void;
}

export function RecommendationSection({ logs, dogName, onStartTraining }: RecommendationSectionProps) {
    const recommendedCourse = useMemo(() => {
        if (!logs || logs.length === 0) return TRAINING_CURRICULUM[0];

        const triggerCounts: Record<string, number> = {};
        logs.forEach(log => {
            if (log.antecedent) {
                triggerCounts[log.antecedent] = (triggerCounts[log.antecedent] || 0) + 1;
            }
        });

        const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

        if (topTrigger?.includes("소리") || topTrigger?.includes("짖")) {
            return TRAINING_CURRICULUM.find(c => c.id === "barking_noise") || TRAINING_CURRICULUM[0];
        }
        if (topTrigger?.includes("배변") || topTrigger?.includes("실수")) {
            return TRAINING_CURRICULUM.find(c => c.id === "toilet_training") || TRAINING_CURRICULUM[0];
        }
        if (topTrigger?.includes("산책") || topTrigger?.includes("줄")) {
            return TRAINING_CURRICULUM.find(c => c.id === "leash_walking") || TRAINING_CURRICULUM[0];
        }

        return TRAINING_CURRICULUM[0];
    }, [logs]);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-lime" />
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                        {dogName}님을 위한 맞춤 솔루션
                    </h3>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-7 rounded-[2.5rem] shadow-elev-base border border-white/60 relative overflow-hidden group/card ring-1 ring-black/5"
            >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-lime/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover/card:scale-110 transition-transform duration-1000" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                            <span className="inline-block px-3 py-1 bg-brand-lime/10 text-brand-lime text-[10px] font-black rounded-full uppercase tracking-widest border border-brand-lime/20 shadow-sm">
                                AI 추천
                            </span>
                            <h4 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">
                                {recommendedCourse.title}
                            </h4>
                        </div>
                    </div>

                    <p className="text-sm font-bold text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                        {recommendedCourse.description}
                    </p>

                    <div className="space-y-4">
                        {/* Stage Preview */}
                        <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-5 space-y-3 border border-white/60 shadow-inner">
                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>커리큘럼 미리보기</span>
                                <span className="text-brand-lime">총 {recommendedCourse.stages.length}단계</span>
                            </div>
                            <div className="space-y-3">
                                {recommendedCourse.stages.slice(0, 2).map((stage, idx) => (
                                    <div key={stage.id} className="flex items-center gap-4 text-sm">
                                        <div className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0 shadow-sm group-hover/card:bg-brand-lime group-hover/card:text-white group-hover/card:border-brand-lime transition-all duration-300">
                                            0{idx + 1}
                                        </div>
                                        <span className="font-black text-gray-700 tracking-tight">{stage.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => onStartTraining?.(recommendedCourse.id)}
                            className="w-full bg-slate-800 text-white p-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-slate-900 hover:shadow-xl hover:shadow-slate-900/10 group/btn"
                        >
                            <div className="w-8 h-8 bg-brand-lime rounded-full flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                <Play className="w-4 h-4 text-slate-800 fill-current ml-0.5" />
                            </div>
                            맞춤 코칭 플랜 시작하기
                        </button>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
