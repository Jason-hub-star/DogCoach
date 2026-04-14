import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { getLabel } from "@/lib/survey-labels";

interface BehaviorIssueSummaryProps {
    dogName: string;
    issues: string[]; // 예: ["barking", "separation", "aggression", "destructive", "potty", "etc"]
    curriculumTitle: string; // 예: "이물질 섭취 교정 프로그램"
}

export function BehaviorIssueSummary({ dogName, issues, curriculumTitle }: BehaviorIssueSummaryProps) {
    // Note: 'etc'의 경우 dashboardData에 이미 치환된 텍스트가 포함되어 있음
    // Backend의 DogEnv에서 chronic_issues.other_text를 처리하여 'etc' → 실제 텍스트로 변환
    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pb-10 font-outfit px-6"
        >
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-brand-lime">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">주요 행동 문제</h3>
                </div>

                <p className="text-sm text-gray-500 break-keep mb-5 font-medium leading-relaxed">
                    {dogName}의 분석 결과, <span className="text-brand-orange-darker font-black">아래 {issues.length}가지 행동 문제</span>가 확인되었습니다.
                </p>
            </div>

            <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-gray-200/40 border border-white relative overflow-hidden">
                {/* Visual Depth */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl -z-10" />

                {/* Issue Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {issues.map((issue, idx) => (
                        <motion.div
                            key={issue}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + idx * 0.1, type: "spring" }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 text-brand-orange-darker text-sm px-4 py-2.5 rounded-full border border-brand-orange/20 font-black shadow-sm"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                            {getLabel(issue, 'issue')}
                        </motion.div>
                    ))}
                </div>

                {/* Curriculum Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="border-t border-gray-100/50 pt-5"
                >
                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-2">
                        선택된 훈련 과정
                    </p>
                    <p className="text-slate-800 font-bold text-base break-keep leading-relaxed">
                        {curriculumTitle}
                    </p>
                </motion.div>
            </div>
        </motion.section>
    );
}
