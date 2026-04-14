"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ThumbsUp, ThumbsDown, Archive, ChevronRight, ChevronLeft, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RecommendationFeedbackAction,
  RecommendationItem,
  RecommendationResponse,
} from "./types";
import { useSubmitRecommendationFeedback } from "@/hooks/useQueries";

interface RecommendationCardProps {
  data: RecommendationResponse | undefined;
  isLoading: boolean;
  token?: string | null;
}

export function RecommendationCard({ data, isLoading, token }: RecommendationCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState<Record<number, RecommendationFeedbackAction>>({});
  const submitFeedback = useSubmitRecommendationFeedback(token);

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
          </div>
          <span className="font-black text-slate-800">AI 분석 중...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-gray-50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.recommendations?.length) {
    return null;
  }

  const recs = data.recommendations;
  const current = recs[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < recs.length - 1;

  const handleFeedback = async (action: RecommendationFeedbackAction) => {
    if (!data?.id || feedbackSent[currentIndex]) return;
    try {
      await submitFeedback.mutateAsync({
        snapshotId: data.id,
        recommendation_index: currentIndex,
        action,
      });
      setFeedbackSent((prev) => ({ ...prev, [currentIndex]: action }));
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 opacity-[0.03]">
        <Brain className="w-32 h-32 text-violet-500" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          <h3 className="font-black text-slate-800">AI 맞춤 추천</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider">
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{recs.length}</span>
        </div>
      </div>

      {/* Rationale */}
      <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed break-keep">
        {data.rationale}
      </p>

      {/* Current Recommendation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-violet-50 to-white rounded-2xl p-5 border border-violet-100/50 mb-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
              {current.priority}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-800 text-base mb-1.5">{current.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed break-keep">{current.description}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation + Feedback */}
      <div className="flex items-center justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => hasPrev && setCurrentIndex((i) => i - 1)}
            disabled={!hasPrev}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              hasPrev ? "bg-gray-100 hover:bg-gray-200 text-gray-600" : "bg-gray-50 text-gray-300"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* Step dots */}
          <div className="flex gap-1.5">
            {recs.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex ? "bg-violet-500 w-4" : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => hasNext && setCurrentIndex((i) => i + 1)}
            disabled={!hasNext}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              hasNext ? "bg-gray-100 hover:bg-gray-200 text-gray-600" : "bg-gray-50 text-gray-300"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback */}
        <div className="flex items-center gap-1.5">
          {feedbackSent[currentIndex] ? (
            <span className="text-[10px] font-bold text-violet-500">
              피드백 완료
            </span>
          ) : (
            <>
              <button
                onClick={() => handleFeedback("helpful")}
                className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 text-green-500 flex items-center justify-center transition-all"
                title="도움됨"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback("not_helpful")}
                className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-all"
                title="도움안됨"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback("archive")}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-all"
                title="보관"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
