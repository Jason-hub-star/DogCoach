"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import type { DashboardData } from "@/components/features/dashboard/types";

interface Props {
  data: DashboardData;
}

export const EnhancementCard = ({ data }: Props) => {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  // Dismiss된 경우 숨김
  if (dismissed) return null;

  // 데이터가 충분한 경우에만 표시하지 않음
  // 이 컴포넌트는 선택 데이터 입력을 유도하므로 항상 표시할 수도 있음
  // 여기서는 간단히 issues와 profile이 있으면 표시하도록 함
  if (!data.dog_profile || !data.issues || data.issues.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-brand-lime/10 to-emerald-50 p-6 rounded-3xl mb-6 border border-brand-lime/20"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-brand-lime/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-brand-dark" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 mb-1">더 정확한 분석을 위해</h3>
          <p className="text-sm text-gray-600 mb-3">
            환경, 건강, 과거 시도 정보를 추가하면 맞춤 추천이 개선됩니다
          </p>
          <button
            onClick={() => router.push("/survey?enhance=true")}
            className="px-4 py-2 border-2 border-brand-lime text-brand-dark rounded-full text-sm font-bold hover:bg-brand-lime/10 transition-colors"
          >
            추가 정보 입력하기
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
