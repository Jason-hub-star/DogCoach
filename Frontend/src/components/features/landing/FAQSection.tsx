"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/Accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "AI가 우리 아이의 행동을 얼마나 정확하게 분석하나요?",
        answer: "테일로그의 행동 분석 알고리즘은 10만 건 이상의 견종별 행동 데이터를 학습했습니다. 95% 이상의 높은 정확도를 자랑하며, 지속적인 업데이트를 통해 미세한 움직임까지 포착해냅니다.",
    },
    {
        question: "영상이나 사진 데이터는 안전하게 보관되나요?",
        answer: "보호자님의 사생활 보호를 위해 모든 데이터는 암호화되어 관리됩니다. 업로드된 자료는 오직 행동 분석 AI 모델 개선 및 담당 수의사/훈련사 상담용으로만 안전하게 사용됩니다.",
    },
    {
        question: "모든 견종이 사용 가능한가요?",
        answer: "네, 대형견부터 소형견까지 모든 견종의 특성을 고려한 분석 모델을 갖추고 있습니다. 견종을 등록해주시면 해당 견종의 행동 발달 패턴과 대조하여 분석 결과를 제공합니다.",
    },
    {
        question: "병원 리포트는 어떻게 활용하면 되나요?",
        answer: "분석된 행동 데이터는 훈련사와 수의사와 상담할 때 매우 유용한 객관적 지표가 됩니다. PDF 리포트를 출력하거나 모바일 화면을 직접 보여드림으로써, 말로 설명하기 힘든 증상을 정확히 전달할 수 있습니다.",
    },
    {
        question: "무료 버전과 유료 버전의 차이는 무엇인가요?",
        answer: "무료 버전은 기초 행동 진단 및 리포트 요약을 제공합니다. 월간 구독 서비스(Premium)를 이용하시면 24시간 실시간 행동 모니터링, 모든 훈련법과 코칭서비스가 포함됩니다.",
    },
];

export function FAQSection() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <section id="faq" className="py-20 md:py-24 bg-gray-50/50">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold mb-4"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span>궁금한 점이 있으신가요?</span>
                    </motion.div>
                    <h2 className="text-[clamp(1.9rem,7vw,2.9rem)] md:text-5xl font-bold text-slate-800 tracking-tight break-keep text-balance-kr">
                        자주 묻는 질문
                    </h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-3xl p-4 md:p-8 shadow-xl shadow-gray-200/50"
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100 last:border-0">
                                <AccordionTrigger className="text-left text-base sm:text-lg font-bold text-slate-800 py-6 hover:text-brand-lime hover:no-underline transition-colors break-keep text-balance-kr">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed pb-6 break-keep text-pretty-kr">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>

              
            </div>
        </section>
    );
}
