"use client";

import { FadeIn } from "@/components/ui/animations/FadeIn";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Free",
        price: "0",
        description: "기록부터 가볍게 시작하는 기본 플랜",
        features: [
            "기본 행동 로그 기록",
            "주간 히트맵 요약",
            "커뮤니티 인사이트",
        ],
        cta: "무료로 시작하기",
        href: "/survey",
        popular: false,
    },
    {
        name: "Pro",
        price: "6,900",
        period: "/월",
        description: "데이터 기반 AI 코칭으로 행동 교정 속도를 높이는 플랜",
        features: [
            "ABC 기반 트리거 분석",
            "맞춤형 일일 미션",
            "리마인더 알림",
            "공유 가능한 PDF 리포트",
        ],
        cta: "Pro 7일 무료 체험",
        href: "/survey",
        popular: true,
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-20 md:py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-[clamp(1.9rem,7vw,2.25rem)] md:text-4xl font-bold text-slate-800 mb-4 leading-tight break-keep text-balance-kr">
                        오늘 1분 기록이
                        <br />
                        <span className="text-brand-orange">다음 10일 행동 변화를 만듭니다.</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed break-keep text-pretty-kr">
                        보호자 루틴에 맞는 플랜을 선택해 시작해보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <FadeIn
                            key={plan.name}
                            delay={index * 0.1}
                            className={cn(
                                "relative p-8 rounded-3xl border flex flex-col",
                                plan.popular
                                    ? "border-brand-lime bg-white shadow-xl scale-105 z-10"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-lime text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                                    <Zap className="w-4 h-4 fill-current" />
                                    가장 인기
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-800">₩{plan.price}</span>
                                    {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
                                </div>
                                <p className="text-gray-500 mt-2 text-sm leading-relaxed break-keep text-pretty-kr">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className={cn("w-5 h-5 shrink-0", plan.popular ? "text-brand-lime" : "text-gray-400")} />
                                        <span className="text-gray-700 text-sm font-medium leading-relaxed break-keep text-pretty-kr">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={cn(
                                    "w-full py-4 rounded-xl text-center font-bold text-sm transition-all",
                                    plan.popular
                                        ? "bg-brand-dark text-white hover:bg-slate-700 shadow-lg hover:shadow-xl"
                                        : "bg-white border border-gray-200 text-slate-800 hover:bg-gray-50"
                                )}
                            >
                                {plan.cta}
                            </Link>
                        </FadeIn>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-400 break-keep text-pretty-kr">
                        프로모션 기간에는 가격이 달라질 수 있습니다.
                    </p>
                </div>
            </div>
        </section>
    );
}
