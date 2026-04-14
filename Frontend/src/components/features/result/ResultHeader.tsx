import { motion } from "framer-motion";
import { Brain, ShieldCheck } from "lucide-react";
import { AnalysisRadarChart } from "./AnalysisRadarChart";
import { getResultCopy } from "./result-copy";

interface ResultHeaderProps {
  dogName: string;
  profileImage: string | null;
  issueTitle: string;
  curriculumId: string;
  score: number;
}

export function ResultHeader({
  dogName,
  profileImage,
  issueTitle,
  curriculumId,
  score,
}: ResultHeaderProps) {
  const copy = getResultCopy(curriculumId);

  return (
    <section className="text-center px-6 py-12 pb-6 font-outfit">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-lime/10 text-brand-lime rounded-full text-[10px] font-black tracking-widest uppercase mb-8 shadow-sm border border-brand-lime/20"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>AI 행동 패턴 분석 완료 · 신뢰도 {score}%</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative mx-auto w-40 h-40 mb-10"
      >
        <div className="absolute inset-x-0 bottom-0 top-0 bg-brand-lime/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative w-full h-full rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden bg-gray-50 flex items-center justify-center text-5xl">
          {profileImage ? (
            <img src={profileImage} alt={dogName} className="w-full h-full object-cover" />
          ) : (
            "🐶"
          )}
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-3 -right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
          <span className="text-sm font-black text-slate-800 tracking-tight">{score}%</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 break-keep leading-tight tracking-tight">
          {dogName}, 지금은
          <br />
          <span className="text-brand-lime">{copy.headline}</span>
        </h1>

        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md mx-auto break-keep font-medium opacity-90 mb-4">
          {copy.subline}
        </p>

        <p className="text-sm font-bold text-gray-800 break-keep mb-3">
          다음 행동: {copy.nextAction}
        </p>

        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
          추천 코스: {issueTitle}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-10 relative"
      >
        <div className="absolute inset-0 bg-brand-lime/5 rounded-full blur-3xl -z-10 scale-75" />
        <AnalysisRadarChart />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-5 mb-10 mx-auto max-w-sm text-left flex items-start gap-3 shadow-xl shadow-gray-200/50"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-brand-lime/10 flex items-center justify-center text-brand-lime mt-0.5">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-slate-800 text-xs mb-1 uppercase tracking-widest opacity-50">
            Analysis Context
          </h4>
          <p className="text-xs text-gray-600 break-keep font-medium leading-relaxed">
            설문 응답과 최근 행동 기록을 함께 분석해 현재 우선순위가 높은 훈련
            방향을 제안한 결과입니다.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
