"use client";

import { SurveyData } from "./types";
import { cn } from "@/lib/utils";
import { Megaphone, Zap, Home, Skull, Ban, MoreHorizontal, X, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    data: SurveyData;
    updateData: (newData: Partial<SurveyData>) => void;
}

export function Step4Problems({ data, updateData }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempInput, setTempInput] = useState(data.chronicIssuesOther || "");

    const problems = [
        { id: 'barking', label: '짖음 / 하울링', icon: <Megaphone className="w-6 h-6" /> },
        { id: 'separation', label: '분리불안', icon: <Home className="w-6 h-6" /> },
        { id: 'aggression', label: '공격성 (입질)', icon: <Zap className="w-6 h-6" /> },
        { id: 'destructive', label: '물건 파괴', icon: <Skull className="w-6 h-6" /> },
        { id: 'potty', label: '배변 실수', icon: <Ban className="w-6 h-6" /> },
        { id: 'etc', label: '기타 행동', icon: <MoreHorizontal className="w-6 h-6" /> },
    ];

    const toggleProblem = (id: string) => {
        if (id === 'etc') {
            setIsModalOpen(true);
            return;
        }

        const current = data.chronicIssues;
        if (current.includes(id)) {
            updateData({ chronicIssues: current.filter(p => p !== id) });
        } else {
            if (current.length >= 3) return; // Max 3
            updateData({ chronicIssues: [...current, id] });
        }
    };

    const handleOtherSave = () => {
        const current = data.chronicIssues;
        if (tempInput.trim()) {
            if (!current.includes('etc')) {
                if (current.length >= 3) {
                    alert("최대 3개까지 선택 가능합니다. 다른 항목을 해제해주세요.");
                    return;
                }
                updateData({
                    chronicIssues: [...current, 'etc'],
                    chronicIssuesOther: tempInput.trim()
                });
            } else {
                updateData({ chronicIssuesOther: tempInput.trim() });
            }
        } else {
            // If empty, deselect 'etc'
            updateData({
                chronicIssues: current.filter(p => p !== 'etc'),
                chronicIssuesOther: ''
            });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">가장 큰 고민은 무엇인가요?</h2>
                <p className="text-gray-500 font-medium">최대 3가지까지 선택할 수 있어요.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {problems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => toggleProblem(item.id)}
                        disabled={!data.chronicIssues.includes(item.id) && data.chronicIssues.length >= 3}
                        className={cn(
                            "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all h-32 gap-3 group relative overflow-hidden",
                            data.chronicIssues.includes(item.id)
                                ? "border-brand-lime bg-brand-lime/5 shadow-sm ring-1 ring-brand-lime"
                                : "border-gray-100 bg-white hover:bg-gray-50 text-gray-400",
                            (!data.chronicIssues.includes(item.id) && data.chronicIssues.length >= 3) && "opacity-50 cursor-not-allowed hover:bg-white"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-2xl transition-all",
                            data.chronicIssues.includes(item.id) ? "bg-brand-lime text-white" : "bg-gray-50 text-gray-400 group-hover:scale-110"
                        )}>
                            {item.icon}
                        </div>
                        <div className="flex flex-col items-center">
                            <span className={cn(
                                "font-bold text-xs md:text-sm whitespace-nowrap",
                                data.chronicIssues.includes(item.id) ? "text-slate-800" : "text-gray-500"
                            )}>
                                {item.id === 'etc' && data.chronicIssuesOther ? data.chronicIssuesOther : item.label}
                            </span>
                        </div>
                    </button>
                ))}
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
                                <h3 className="text-xl font-black text-slate-800 mb-2">기타 행동 입력</h3>
                                <p className="text-sm text-gray-500">목록에 없는 우리 아이만의 고민이 있나요?</p>
                            </div>

                            <div className="px-8 py-4">
                                <div className="relative group">
                                    <textarea
                                        value={tempInput}
                                        onChange={(e) => setTempInput(e.target.value)}
                                        placeholder="예: 산책 중 오토바이를 보면 짖음"
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
