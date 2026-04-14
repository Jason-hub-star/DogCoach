"use client";

import { SurveyData } from "./types";
import { cn } from "@/lib/utils";
import { XCircle, MicOff, Frown, HandMetal, MoreHorizontal, X, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    data: SurveyData;
    updateData: (newData: Partial<SurveyData>) => void;
}

export function Step6PastAttempts({ data, updateData }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempInput, setTempInput] = useState(data.pastAttemptsOther || "");

    const attempts = [
        { id: 'scolding', label: '혼내기 / 소리치기', icon: <MegaphoneIcon className="w-5 h-5" /> },
        { id: 'ignoring', label: '무시하기 (등 돌리기)', icon: <MicOff className="w-5 h-5" /> },
        { id: 'blocking', label: '바디 블로킹', icon: <HandMetal className="w-5 h-5" /> },
        { id: 'distraction', label: '간식으로 시선 돌리기', icon: <Frown className="w-5 h-5" /> },
        { id: 'etc', label: '기타 (직접 입력)', icon: <MoreHorizontal className="w-5 h-5" /> },
    ];

    const toggleAttempt = (id: string) => {
        if (id === 'etc') {
            setIsModalOpen(true);
            return;
        }

        // If 'none' was selected, clear it
        let current = data.pastAttempts;
        if (current.includes('none')) {
            current = [];
        }

        if (current.includes(id)) {
            updateData({ pastAttempts: current.filter(a => a !== id) });
        } else {
            updateData({ pastAttempts: [...current, id] });
        }
    };

    const handleOtherSave = () => {
        let current = data.pastAttempts;
        if (current.includes('none')) {
            current = [];
        }

        if (tempInput.trim()) {
            if (!current.includes('etc')) {
                updateData({
                    pastAttempts: [...current, 'etc'],
                    pastAttemptsOther: tempInput.trim()
                });
            } else {
                updateData({ pastAttemptsOther: tempInput.trim() });
            }
        } else {
            updateData({
                pastAttempts: current.filter(t => t !== 'etc'),
                pastAttemptsOther: ''
            });
        }
        setIsModalOpen(false);
    };

    const handleNoneToggle = () => {
        if (data.pastAttempts.includes('none')) {
            updateData({ pastAttempts: [], pastAttemptsOther: '' });
        } else {
            updateData({ pastAttempts: ['none'], pastAttemptsOther: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">효과가 없던 방법은?</h2>
                <p className="text-gray-500 break-keep font-medium">과거에 시도했지만 실패했던 경험을 알려주시면, 중복된 조언을 피할 수 있어요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attempts.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => toggleAttempt(item.id)}
                        className={cn(
                            "p-5 rounded-3xl border transition-all flex flex-col items-center gap-3 text-center group",
                            data.pastAttempts.includes(item.id)
                                ? "border-red-400 bg-red-50 text-red-600 font-bold shadow-sm"
                                : "border-gray-100 bg-white hover:bg-gray-50 text-gray-400"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-2xl transition-all",
                            data.pastAttempts.includes(item.id) ? "bg-red-200 text-red-600" : "bg-gray-50 text-gray-400 group-hover:scale-110"
                        )}>
                            {item.icon}
                        </div>
                        <span className={cn(
                            "text-xs md:text-sm whitespace-nowrap",
                            data.pastAttempts.includes(item.id) ? "text-slate-800" : "text-gray-500"
                        )}>
                            {item.id === 'etc' && data.pastAttemptsOther ? data.pastAttemptsOther : item.label}
                        </span>
                    </button>
                ))}

                <button
                    onClick={handleNoneToggle}
                    className={cn(
                        "p-5 rounded-3xl border transition-all flex flex-col items-center justify-center gap-3 text-center col-span-1 md:col-span-2",
                        data.pastAttempts.includes('none')
                            ? "border-brand-lime bg-brand-lime text-white font-bold shadow-lg shadow-brand-lime/20"
                            : "border-gray-100 bg-white hover:bg-gray-50 text-gray-400"
                    )}
                >
                    <span className="text-sm">특별히 시도해본 적 없어요</span>
                </button>
            </div>

            {/* Premium Other Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden relative shadow-2xl border border-gray-100 z-10"
                        >
                            <div className="p-8 pb-4 text-center">
                                <h3 className="text-xl font-black text-slate-800 mb-2">과거 시도 입력</h3>
                                <p className="text-sm text-gray-500">목록에 없지만 시도해본 특이한 방법이 있나요?</p>
                            </div>

                            <div className="px-8 py-4">
                                <div className="relative group">
                                    <textarea
                                        value={tempInput}
                                        onChange={(e) => setTempInput(e.target.value)}
                                        placeholder="예: 클리커 트레이닝, 전문 훈련사 방문 등"
                                        className="w-full h-32 p-5 rounded-2xl bg-gray-50 border-transparent focus:border-brand-lime focus:bg-white focus:ring-4 focus:ring-brand-lime/10 outline-none transition-all text-sm resize-none font-medium"
                                        autoFocus
                                    />
                                    {tempInput && (
                                        <button
                                            onClick={() => setTempInput('')}
                                            className="absolute right-3 top-3 p-1.5 rounded-full bg-gray-200/50 text-gray-500 hover:bg-gray-200 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-all text-sm"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleOtherSave}
                                    className="flex-[2] py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-brand-lime font-black shadow-lg shadow-gray-200 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    저장하기
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Icon helper
function MegaphoneIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
    )
}
