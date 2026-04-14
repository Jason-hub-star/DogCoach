"use client";

import { motion } from "framer-motion";

const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];
const timeLabels = ["아침", "낮", "저녁", "밤"];

export function BehaviorMapSection() {
    return (
        <section className="py-20 md:py-24 bg-brand-dark text-white overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12">
                <div className="flex-1 space-y-6">
                    <h2 className="text-[clamp(1.9rem,7vw,2.25rem)] md:text-4xl font-bold leading-tight break-keep text-balance-kr">
                        히트맵 한 장으로
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lime to-brand-orange">
                            언제, 왜 반응하는지
                        </span>
                        를 보세요
                    </h2>
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed break-keep text-pretty-kr">
                        색이 진할수록 같은 시간대에 문제 행동이 자주 반복됐다는 뜻입니다.
                        <br className="hidden md:block" />
                        보호자는 "어느 시간/상황을 먼저 바꿔야 하는지"를 바로 판단할 수 있습니다.
                    </p>
                    <ul className="space-y-3 pt-2 text-sm sm:text-base leading-relaxed text-gray-300">
                        <li className="break-keep text-pretty-kr">진한 칸: 반응이 몰린 고위험 구간</li>
                        <li className="break-keep text-pretty-kr">연한 칸: 관찰은 필요하지만 우선순위는 낮은 구간</li>
                        <li className="break-keep text-pretty-kr">주간 변화: 지난주 대비 감소/증가 추세 확인</li>
                    </ul>
                </div>

                <div className="flex-1 w-full max-w-md">
                    <motion.div
                        className="relative aspect-square bg-slate-700 rounded-2xl p-6 border border-gray-700 shadow-2xl"
                        initial={{ rotate: 4, opacity: 0 }}
                        whileInView={{ rotate: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-gray-300">최근 3주 행동 히트맵</span>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <span>낮음</span>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-sm bg-gray-600" />
                                        <div className="w-2 h-2 rounded-sm bg-brand-lime/60" />
                                        <div className="w-2 h-2 rounded-sm bg-brand-lime" />
                                        <div className="w-2 h-2 rounded-sm bg-brand-orange" />
                                    </div>
                                    <span>높음</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {dayLabels.map((d) => (
                                    <span key={d} className="text-[10px] text-gray-400 text-center">{d}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 49 }).map((_, i) => {
                                    const hot = [10, 11, 18, 24, 25, 32].includes(i);
                                    const warm = [9, 12, 17, 19, 31, 33, 38, 39].includes(i);
                                    return (
                                        <motion.div
                                            key={i}
                                            className={`aspect-square rounded-sm ${hot ? "bg-brand-orange shadow-glow-orange-sm" : warm ? "bg-brand-lime" : "bg-gray-700/50"}`}
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            transition={{ delay: i * 0.008 }}
                                        />
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-4 gap-2 mt-3">
                                {timeLabels.map((t) => (
                                    <span key={t} className="text-[10px] text-gray-400 text-center">{t}</span>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg border border-brand-lime/30 bg-brand-lime/10 p-3">
                                <p className="text-xs text-brand-lime font-bold">해석 예시</p>
                                <p className="text-xs text-gray-300 mt-1 leading-relaxed break-keep text-pretty-kr">
                                    금요일 저녁과 토요일 밤 칸이 진하면, 방문자/외부 소리 자극을 먼저 관리하는 것이 효과적입니다.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
