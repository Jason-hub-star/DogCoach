/* 일반적인 조언과 TailLog의 데이터 기반 처방을 대비해 보여주는 섹션입니다.
   일반 조언 카드는 재사용 가능한 강아지 사진을 유튜브 스타일 썸네일로 구성해 보여줍니다. */
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { XCircle, CheckCircle, PlayCircle } from "lucide-react";

const GENERIC_BARKING_THUMBNAIL = {
    src: "/images/landing/dog-portrait-placeholder-1600.jpg",
    title: "짖음 훈련, 누구에게나 같은 답일까요?",
    credit: "사진: Owlf / Wikimedia Commons",
    license: "CC BY-SA 4.0",
};

export function ProblemSection() {
    return (
        <section className="py-20 md:py-24 bg-gray-50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-[clamp(1.9rem,7vw,2.25rem)] md:text-4xl font-bold text-slate-800 mb-4 leading-tight break-keep text-balance-kr">
                        유튜브 보고 따라 해도<br />
                        <span className="text-brand-orange">우리 아이에겐 안 맞지 않던가요?</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed break-keep text-pretty-kr">
                        강아지마다 성격도, 환경도 다릅니다. <br className="hidden md:block" />
                        모두에게 똑같은 "국민 훈련법"은 정답이 아닐 수 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* BAD: Generic Video */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-white border border-gray-200 grayscale opacity-80"
                    >
                        <div className="flex items-center gap-2 mb-6 text-gray-500">
                            <XCircle className="w-6 h-6" />
                            <span className="font-bold text-lg">일반적인 조언</span>
                        </div>
                        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-slate-950 shadow-sm">
                            <div className="relative aspect-video">
                                <Image
                                    src={GENERIC_BARKING_THUMBNAIL.src}
                                    alt="일반적인 훈련 영상을 상징하는 강아지 사진 썸네일"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="rounded-full bg-red-500/95 p-3 shadow-xl ring-4 ring-white/20">
                                        <PlayCircle className="h-10 w-10 fill-white text-white" />
                                    </div>
                                </div>
                                <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                                            {GENERIC_BARKING_THUMBNAIL.title}
                                        </p>
                                        <p className="mt-1 text-[11px] text-white/70">
                                            흔히 보는 일반 훈련 영상 형식의 예시 화면
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">
                                        08:24
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start justify-between gap-3 border-t border-white/10 bg-slate-900/95 px-4 py-3 text-left">
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-300">
                                        {GENERIC_BARKING_THUMBNAIL.credit}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        라이선스: {GENERIC_BARKING_THUMBNAIL.license}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                    예시 썸네일
                                </span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 break-keep text-balance-kr">
                            "짖으면 간식을 주지 마세요"
                        </h3>
                        <p className="text-gray-500 leading-relaxed break-keep text-pretty-kr">
                            원인을 모른 채 무조건 참게 하거나, <br className="hidden md:block" />
                            우리 아이의 시간대와 자극 맥락은 빠진 훈련법.
                        </p>
                    </motion.div>

                    {/* GOOD: TailLog Data */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-white border-2 border-brand-lime shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-brand-lime text-white text-xs font-bold px-3 py-1 rounded-bl-xl">TailLog 솔루션</div>
                        <div className="flex items-center gap-2 mb-6 text-brand-dark">
                            <CheckCircle className="w-6 h-6 text-brand-lime" />
                            <span className="font-bold text-lg">데이터 기반 맞춤 처방</span>
                        </div>

                        {/* Visual Representation of Insight */}
                        <div className="bg-brand-lime/10 rounded-xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-brand-lime uppercase">인사이트 카드</span>
                                <span className="text-xs text-gray-500">방금 전</span>
                            </div>
                            <p className="text-gray-800 font-medium text-sm leading-relaxed break-keep text-pretty-kr">
                                "머루는 <span className="text-brand-orange font-bold">화요일 저녁 8시 현관 소음</span>에 예민하군요.<br className="hidden md:block" />
                                이 시간엔 '앉아' 대신 <span className="underline decoration-brand-lime decoration-2">노즈워크</span>를 먼저 시도해보세요."
                            </p>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 break-keep text-balance-kr">
                            "시간, 장소, 원인에 맞는 솔루션"
                        </h3>
                        <p className="text-gray-600 leading-relaxed break-keep text-pretty-kr">
                            언제, 어디서, 왜 짖는지 분석하여 <br className="hidden md:block" />
                            가장 효과적인 행동 교정법을 제안합니다.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
