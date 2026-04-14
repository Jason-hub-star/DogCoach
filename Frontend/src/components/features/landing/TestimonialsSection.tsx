"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "김민수 보호자님",
        dogName: "초코",
        role: "분리불안 개선",
        content:
            "퇴근 직후 짖음이 왜 올라가는지 데이터로 확인하고 나서, 귀가 루틴을 바꿨더니 2주 만에 반응이 크게 줄었어요.",
        result: "짖음 빈도 -32%",
        rating: 5,
    },
    {
        name: "이연아 보호자님",
        dogName: "구름",
        role: "입질 행동 교정",
        content:
            "감으로 대응할 때는 매번 실패했는데, 트리거 시간대를 먼저 피하고 대체 행동을 넣으니 입질이 눈에 띄게 줄었습니다.",
        result: "입질 에피소드 -41%",
        rating: 5,
    },
    {
        name: "박준호 보호자님",
        dogName: "맥스",
        role: "산책 매너 개선",
        content:
            "병원 상담 때 리포트를 보여주니 설명이 훨씬 쉬웠어요. 산책 중 끌어당김도 주차별로 줄어드는 게 보여서 동기부여가 됩니다.",
        result: "리드 당김 -27%",
        rating: 5,
    },
];

export function TestimonialsSection() {
    return (
        <section className="py-20 md:py-24 bg-white overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 text-brand-lime text-sm font-bold mb-4"
                    >
                        <Star className="w-4 h-4 fill-current" />
                        <span>리얼 후기</span>
                    </motion.div>
                    <h2 className="text-[clamp(1.9rem,7vw,2.9rem)] md:text-5xl font-bold text-slate-800 tracking-tight break-keep text-balance-kr">
                        이미 <span className="text-brand-lime font-outfit">5,000+</span> 보호자님이
                        <br />
                        기록 기반 훈련을 시작했습니다
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full border-none shadow-xl shadow-gray-100 hover:shadow-2xl hover:shadow-brand-lime/5 transition-all duration-300 bg-orange-50/20">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <Quote className="w-10 h-10 text-brand-lime/20 mb-4" />

                                    <p className="text-[15px] sm:text-base text-gray-700 leading-relaxed mb-8 break-keep text-pretty-kr flex-1 italic">
                                        "{item.content}"
                                    </p>

                                    <div className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold mb-5 w-fit">
                                        {item.result}
                                    </div>

                                    <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm bg-brand-lime/15">
                                            <AvatarFallback className="font-black text-brand-dark">
                                                {item.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                                            <div className="text-gray-500 text-xs font-medium break-keep text-pretty-kr">
                                                {item.dogName} ({item.role})
                                            </div>
                                        </div>
                                        <div className="ml-auto flex gap-0.5">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 text-brand-orange fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
