"use client";

import { motion } from "framer-motion";

export function ABCSolutionSection() {
    return (
        <section id="service-intro" className="py-20 md:py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-lime/5" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="text-brand-lime font-bold tracking-wider text-sm uppercase mb-2 block">
                        TailLog Method
                    </span>
                    <h2 className="text-[clamp(1.9rem,7vw,2.25rem)] md:text-4xl font-bold text-slate-800 mb-4 leading-tight break-keep text-balance-kr">
                        행동 분석의 핵심, <span className="text-brand-lime">ABC 모델</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed break-keep text-pretty-kr">
                        단순 기록이 아니라 상황(A), 행동(B), 결과(C)를 연결해서
                        <br className="hidden md:block" />
                        문제의 원인을 찾고 다음 행동을 제안합니다.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
                    <motion.div
                        className="flex-1 w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative group hover:border-brand-lime transition-colors"
                        whileHover={{ y: -5 }}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500 mb-4 group-hover:bg-brand-lime group-hover:text-white transition-colors">
                            A
                        </div>
                        <h3 className="font-bold text-lg mb-2 break-keep text-balance-kr">Antecedent (상황)</h3>
                        <p className="text-sm text-gray-500 break-keep text-pretty-kr">"초인종 소리가 났을 때"</p>
                    </motion.div>

                    <div className="text-gray-300 md:rotate-0 rotate-90">→</div>

                    <motion.div
                        className="flex-1 w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative group hover:border-brand-lime transition-colors"
                        whileHover={{ y: -5 }}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500 mb-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                            B
                        </div>
                        <h3 className="font-bold text-lg mb-2 break-keep text-balance-kr">Behavior (행동)</h3>
                        <p className="text-sm text-gray-500 break-keep text-pretty-kr">"현관으로 달려가 짖음"</p>
                    </motion.div>

                    <div className="text-gray-300 md:rotate-0 rotate-90">→</div>

                    <motion.div
                        className="flex-1 w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative group hover:border-brand-lime transition-colors"
                        whileHover={{ y: -5 }}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            C
                        </div>
                        <h3 className="font-bold text-lg mb-2 break-keep text-balance-kr">Consequence (결과)</h3>
                        <p className="text-sm text-gray-500 break-keep text-pretty-kr">"보호자가 안아주며 달램"</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-2xl mx-auto mt-12 bg-slate-800 text-slate-50 p-6 rounded-2xl relative"
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-lime text-brand-dark text-xs font-bold rounded-full">
                        AI 코치 인사이트
                    </div>
                    <p className="text-center font-medium leading-relaxed break-keep text-pretty-kr">
                        "짖은 직후 안아주는 반응이 반복되면 짖음이 강화될 수 있어요. 먼저
                        '자리 지키기' 대체 행동을 연습해보세요."
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
