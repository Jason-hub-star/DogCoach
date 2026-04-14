"use client";

import { motion } from "framer-motion";
import { FileText, Stethoscope } from "lucide-react";
import { REPORT_SAMPLE_PREVIEW } from "@/components/features/log/ReportDocument";

export function ExpertSynergySection() {
    const totalLogs = REPORT_SAMPLE_PREVIEW.logs.length;

    return (
        <section className="py-20 md:py-24 bg-gray-50 border-t border-gray-200">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                    <div className="flex-1 space-y-6 order-2 md:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-2">
                            <Stethoscope className="w-3 h-3" />
                            수의사 협진 대응
                        </div>
                        <h2 className="text-[clamp(1.9rem,7vw,2.25rem)] md:text-4xl font-bold text-slate-800 leading-tight break-keep text-balance-kr">
                            병원 상담에서도
                            <br />
                            설명이 아닌 근거로 대화하세요
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 leading-relaxed break-keep text-pretty-kr">
                            "집에서는 어떤 상황에서 반응하나요?"라는 질문에
                            <br className="hidden md:block" />
                            기억이 아니라 기록으로 답할 수 있습니다. TailLog 리포트는 실제 상담에서 바로 보여줄 수 있는
                            <span className="font-bold text-slate-800"> 요약 문진표</span>를 제공합니다.
                        </p>
                    </div>

                    <div className="flex-1 order-1 md:order-2 w-full max-w-md relative">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative bg-white p-6 rounded-xl shadow-2xl border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500"
                        >
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="font-bold text-slate-800">TailLog 리포트 샘플</span>
                                </div>
                                <span className="text-xs text-brand-lime font-bold bg-brand-lime/10 px-2 py-1 rounded">PREVIEW</span>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <p className="text-[11px] font-bold text-slate-800">{REPORT_SAMPLE_PREVIEW.dogName} 행동 리포트</p>
                                    <p className="text-[10px] text-gray-500">최근 로그 {totalLogs}건 · 신뢰도 {REPORT_SAMPLE_PREVIEW.summary.confidence}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-md bg-gray-50 p-2">
                                        <p className="text-[10px] text-gray-500">주요 자극</p>
                                        <p className="text-[10px] font-bold text-slate-800">{REPORT_SAMPLE_PREVIEW.summary.mainTrigger}</p>
                                    </div>
                                    <div className="rounded-md bg-gray-50 p-2">
                                        <p className="text-[10px] text-gray-500">주간 변화</p>
                                        <p className="text-[10px] font-bold text-emerald-600">{REPORT_SAMPLE_PREVIEW.summary.weeklyChange}</p>
                                    </div>
                                    <div className="rounded-md bg-gray-50 p-2">
                                        <p className="text-[10px] text-gray-500">로그 수</p>
                                        <p className="text-[10px] font-bold text-slate-800">{totalLogs}건</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-dashed border-gray-200 bg-white p-3">
                                    <p className="text-[10px] font-bold text-gray-700 mb-1">AI 인사이트</p>
                                    <p className="text-[10px] leading-relaxed text-gray-600">{REPORT_SAMPLE_PREVIEW.aiAnalysis.insight}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
