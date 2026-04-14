"use client";

import { AlertCircle } from "lucide-react";

interface Props {
  onResume: () => void;
}

export const CoreDataRequiredBanner = ({ onResume }: Props) => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="max-w-md text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-slate-800">필수 정보가 부족합니다</h2>
      <p className="text-gray-600 mb-6">
        맞춤 분석을 위해 아래 정보가 필요합니다:
      </p>
      <ul className="list-disc list-inside text-left text-gray-700 mb-6 space-y-2">
        <li>견종 정보</li>
        <li>주요 행동 문제 (최소 1개)</li>
        <li>문제 발생 상황 (트리거)</li>
      </ul>
      <button
        onClick={onResume}
        className="px-6 py-3 bg-brand-dark text-white rounded-full font-bold hover:bg-slate-700 transition-colors shadow-lg"
      >
        설문 완료하기
      </button>
    </div>
  </div>
);
