"use client";

import { motion } from "framer-motion";

const steps = [
    { num: "01", title: "3분 설문", desc: "아이의 생활 패턴을 알려주세요." },
    { num: "02", title: "리포트 받기", desc: "행동 원인을 즉시 분석해드려요." },
    { num: "03", title: "데일리 기록", desc: "10초 만에 문제 행동을 기록하세요." },
    { num: "04", title: "AI 코치", desc: "매일 피드백과 훈련법을 받으세요." },
];

export function ProcessSection() {
    return (
        <section className="py-20 md:py-24 bg-brand-dark text-white relative overflow-hidden">
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="mb-16">
                    <h2 className="text-[clamp(1.9rem,7vw,2.25rem)] md:text-4xl font-bold mb-4 break-keep text-balance-kr">TailLog 이용 방법</h2>
                    <p className="text-sm sm:text-base text-gray-400 break-keep text-pretty-kr">간단하고, 효과적이며, 습관이 됩니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="text-4xl md:text-5xl font-black text-brand-lime/20 mb-4">{step.num}</div>
                            <h3 className="text-xl font-bold mb-2 text-brand-lime break-keep text-balance-kr">{step.title}</h3>
                            <p className="text-sm md:text-base text-gray-400 leading-relaxed break-keep text-pretty-kr">{step.desc}</p>

                            {index !== steps.length - 1 && (
                                <div className="hidden md:block absolute top-8 right-0 w-full h-[2px] bg-gradient-to-r from-brand-lime/20 to-transparent -z-10 translate-x-1/2" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
