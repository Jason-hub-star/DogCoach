"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Dog,
  Eye,
  Flag,
  Footprints,
  Home,
  Music,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeOnboardingModalProps {
  isOpen: boolean;
  onStart: () => void;
}

export function ChallengeOnboardingModal({
  isOpen,
  onStart,
}: ChallengeOnboardingModalProps) {
  if (!isOpen) return null;

  // 7 Steps Preview (Day 1 is recommended start, but all days are explorable)
  const steps = [
    { day: 1, icon: Home, label: "환경 설정", recommended: true },
    { day: 2, icon: Shield, label: "안전", recommended: false },
    { day: 3, icon: Music, label: "소리 적응", recommended: false },
    { day: 4, icon: Dog, label: "기초", recommended: false },
    { day: 5, icon: Eye, label: "관찰", recommended: false },
    { day: 6, icon: Footprints, label: "산책", recommended: false },
    { day: 7, icon: Flag, label: "완성", recommended: false },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-sm md:max-w-md relative shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
      >
        {/* Scroll area: prevents mobile footer/CTA from being pushed off-screen */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-10 text-center bg-gradient-to-b from-brand-lime/10 to-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-lime text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm">
              <Sparkles className="w-3 h-3" />
              맞춤형 미션
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 break-keep leading-tight">
              추천 플랜으로 바로 시작,
              <br />
              원하면 Day를 바꿔도 돼요
            </h2>
            <p className="text-sm text-gray-500 font-medium break-keep">
              Day 1부터 시작해도 좋고, 필요한 미션부터 골라 시작할 수 있어요.
            </p>
          </div>

          <div className="p-6 relative min-h-[350px] flex items-center justify-center -mt-8">
            {/* S-Shape Path SVG Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
              viewBox="0 0 300 400"
            >
              <motion.path
                d="M150,50 C250,50 250,150 150,150 C50,150 50,250 150,250 C250,250 250,350 150,350"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="1 20"
                className="text-brand-lime"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>

            {/* Nodes Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-14 relative z-10 w-full max-w-[260px]">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.day}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={cn(
                    "flex flex-col items-center gap-2",
                    step.recommended ? "text-brand-lime" : "text-gray-500"
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border-2 transition-all",
                      step.recommended
                        ? "bg-white border-brand-lime shadow-brand-lime/20 scale-110"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <step.icon
                      className={cn(
                        "w-6 h-6",
                        step.recommended ? "stroke-[2.5]" : "stroke-[1.8]"
                      )}
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-tight">
                    Day {step.day}
                  </span>
                  <span className="text-[10px] font-bold tracking-tight">
                    {step.label}
                  </span>
                  {step.recommended && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-lime">
                      추천 시작
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA: safe-area padding so the button is always tappable on mobile */}
        <div className="p-8 pt-0 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-white">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="w-full bg-slate-800 hover:bg-slate-900 text-brand-lime font-black py-5 rounded-2xl shadow-xl shadow-gray-200 transition-all text-lg flex items-center justify-center gap-2 group"
          >
            플랜 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
