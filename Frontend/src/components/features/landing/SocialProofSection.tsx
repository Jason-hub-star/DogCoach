"use client";

import { motion } from "framer-motion";
import { Star, Users, FileText } from "lucide-react";

const stats = [
    { label: "함께하는 보호자", value: "5,000+", icon: Users },
    { label: "누적 행동 로그", value: "100,000+", icon: FileText },
    { label: "평균 만족도", value: "4.9/5.0", icon: Star },
];

export function SocialProofSection() {
    return (
        <section className="py-12 border-y border-gray-100 bg-white/50 backdrop-blur-sm">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col md:flex-row justify-center items-center gap-7 md:gap-16">
                    <div className="text-center md:text-left">
                        <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed break-keep text-pretty-kr">
                            이미 많은 보호자님들이<br className="md:hidden" />
                            긍정적인 변화를 경험하고 있어요.
                        </p>
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden md:block" />

                    <div className="grid grid-cols-3 gap-5 sm:gap-8 md:gap-16">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="flex items-center justify-center gap-1.5 mb-1 text-brand-orange">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 font-mono tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="text-[11px] sm:text-xs md:text-sm text-gray-500 font-medium break-keep text-pretty-kr">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
