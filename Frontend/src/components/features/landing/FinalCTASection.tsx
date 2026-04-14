"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FinalCTASection() {
    return (
        <section className="py-20 md:py-24 relative overflow-hidden">
            {/* Background Magic */}
            <div className="absolute inset-0 bg-brand-dark" />
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-lime rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-orange rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-lime text-sm font-bold mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>지금 시작하면 첫 리포트 무료</span>
                    </div>

                    <h2 className="text-[clamp(2rem,8vw,3.75rem)] md:text-6xl font-bold text-white tracking-tight break-keep text-balance-kr leading-tight">
                        데이터로 대화하는 펫 라이프,<br />
                        <span className="text-brand-lime">테일로그</span>와 함께 시작하세요.
                    </h2>

                    <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed break-keep text-pretty-kr">
                        이미 5,000명의 보호자가 경험하고 있습니다.<br className="hidden md:block" />
                        3분이면 충분합니다. 아이의 진심을 데이터로 확인해보세요.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link
                            href="/survey"
                            className={cn(
                                "group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-bold text-brand-dark transition-all bg-brand-lime rounded-full overflow-hidden hover:scale-105 shadow-2xl shadow-brand-lime/30"
                            )}
                        >
                            <span className="relative z-10 flex items-center">
                                무료 분석 시작하기
                                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-10 md:pt-12 text-gray-400 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-brand-lime" />
                            <span className="break-keep text-pretty-kr">가입 없이 무료 체험</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-brand-lime" />
                            <span className="break-keep text-pretty-kr">행동 전문가 소견 포함</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-brand-lime" />
                            <span className="break-keep text-pretty-kr">언제든 해지 가능</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
