/* 랜딩 첫 화면의 핵심 가치 제안과 CTA를 보여주는 히어로 섹션입니다.
   모바일에서는 한국어 문장이 의미 단위로 안정적으로 줄바꿈되도록 구성합니다. */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDogProfile } from "@/hooks/useQueries";

export function HeroSection() {
    const { user, token } = useAuth();
    const isLoggedIn = !!user && !user.is_anonymous;
    const { data: dogProfile } = useDogProfile(token);
    const hasDog = isLoggedIn && !!dogProfile?.basic?.id;
    const dogName = "아이";

    return (
        <section className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-orange-50/20">
            {/* Background Decor (Organic Blobs) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-lime/10 rounded-full blur-[120px] -z-0"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px] -z-0"
            />

            <div className="container px-5 md:px-6 relative z-10 flex flex-col items-center text-center">
                <div className="max-w-4xl space-y-8 md:space-y-10">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-xl shadow-gray-200/40 text-xs sm:text-sm font-bold text-brand-dark mb-2 md:mb-4 hover:border-brand-lime transition-all cursor-default"
                    >
                        <Sparkles className="w-4 h-4 text-brand-orange" />
                        <span>데이터로 읽는 우리 아이의 속마음</span>
                    </motion.div>

                    {/* Copy - Massive Typography */}
                    <h1 className="text-[clamp(2.1rem,10vw,4.75rem)] md:text-8xl font-black tracking-[-0.02em] text-slate-800 leading-[1.18] md:leading-[1.1] break-keep text-balance-kr font-outfit">
                        {[
                            `${dogName}의 짖음,`,
                            "감이 아닌",
                            "데이터로 해결하세요.",
                        ].map((line, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * i }}
                                className="block md:inline md:mr-[0.24em]"
                            >
                                {line === "데이터로 해결하세요." ? (
                                    <>
                                        <span className="text-brand-lime relative inline-block">
                                            데이터로
                                            <motion.span
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 0.8, delay: 0.35 }}
                                                className="absolute bottom-2 left-0 h-3 bg-brand-lime/20 -z-10 rounded-sm"
                                            />
                                        </span>{" "}
                                        해결하세요.
                                    </>
                                ) : (
                                    line
                                )}
                            </motion.span>
                        ))}
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="text-lg sm:text-xl md:text-3xl text-gray-500 max-w-3xl mx-auto leading-[1.8] md:leading-relaxed break-keep text-pretty-kr font-medium"
                    >
                        <span className="block md:inline">매번 똑같은 훈련 영상은 그만.</span>{" "}
                        <span className="block md:inline">
                            <span className="text-slate-800 font-bold underline decoration-brand-lime decoration-4 underline-offset-4">
                                TailLog
                            </span>
                            가 {dogName}의 행동 패턴을 정밀 분석해
                        </span>{" "}
                        <span className="block md:inline">딱 맞는 솔루션을 처방합니다.</span>
                    </motion.p>

                    {/* CTA Group */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.8 }}
                        className="flex flex-col sm:flex-row gap-5 md:gap-6 justify-center pt-6 md:pt-8 items-center"
                    >
                        <Link
                            href={hasDog ? "/dashboard" : "/survey"}
                            className={cn(
                                "group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-bold text-white transition-all bg-brand-lime rounded-full overflow-hidden hover:scale-105 shadow-2xl shadow-brand-lime/30"
                            )}
                        >
                            <span className="relative z-10 flex items-center">
                                {hasDog ? "내 대시보드로 이동" : `무료 리포트 받기`}
                                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>
                        <div className="flex flex-col items-center sm:items-start gap-1">
                            <span className="text-sm text-gray-400 font-medium">⚡️ 지금 3,241명이 상담 중</span>
                            <div className="flex -space-x-2">
                                {["🐶", "🐕", "🦴", "🐾"].map((icon, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full border-2 border-white bg-brand-lime/20 flex items-center justify-center text-[10px]"
                                        aria-label="tailog-community"
                                    >
                                        {icon}
                                    </div>
                                ))}
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-brand-lime flex items-center justify-center text-[8px] font-bold text-brand-dark">
                                    +
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
