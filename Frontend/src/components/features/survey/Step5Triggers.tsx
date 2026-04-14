"use client";

import { SurveyData } from "./types";
import { cn } from "@/lib/utils";
import { Bell, UserX, DoorOpen, Hand, Box, Monitor, MoreHorizontal, X, Check } from "lucide-react";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    data: SurveyData;
    updateData: (newData: Partial<SurveyData>) => void;
}

export function Step5Triggers({ data, updateData }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempInput, setTempInput] = useState(data.triggersOther || "");

    const triggers = [
        { id: 'doorbell', label: '초인종 / 노크 소리', icon: <Bell className="w-5 h-5" /> },
        { id: 'stranger', label: '낯선 사람 방문', icon: <DoorOpen className="w-5 h-5" /> },
        { id: 'separation', label: '보호자 외출 시', icon: <UserX className="w-5 h-5" /> },
        { id: 'touch', label: '특정 신체 터치', icon: <Hand className="w-5 h-5" /> },
        { id: 'delivery', label: '택배/오토바이 소리', icon: <Box className="w-5 h-5" /> },
        { id: 'screen', label: 'TV/화면 속 동물', icon: <Monitor className="w-5 h-5" /> },
        { id: 'etc', label: '기타 상황 (직접 입력)', icon: <MoreHorizontal className="w-5 h-5" /> },
    ];

    const toggleTrigger = (id: string) => {
        if (id === 'etc') {
            setIsModalOpen(true);
            return;
        }

        const current = data.triggers;
        if (current.includes(id)) {
            updateData({ triggers: current.filter(t => t !== id) });
        } else {
            updateData({ triggers: [...current, id] });
        }
    };

    const handleOtherSave = () => {
        const current = data.triggers;
        if (tempInput.trim()) {
            if (!current.includes('etc')) {
                updateData({
                    triggers: [...current, 'etc'],
                    triggersOther: tempInput.trim()
                });
            } else {
                updateData({ triggersOther: tempInput.trim() });
            }
        } else {
            updateData({
                triggers: current.filter(t => t !== 'etc'),
                triggersOther: ''
            });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">언제 주로 반응하나요?</h2>
                <p className="text-gray-500 w-full break-keep font-medium">정확한 원인 파악을 위해 구체적인 상황을 알려주세요.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {triggers.map((item) => (
                    <SelectableCard
                        key={item.id}
                        selected={data.triggers.includes(item.id)}
                        onClick={() => toggleTrigger(item.id)}
                        icon={item.icon}
                        label={item.id === 'etc' && data.triggersOther ? data.triggersOther : item.label}
                    />
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
                                <h3 className="text-xl font-black text-slate-800 mb-2">특수한 상황 입력</h3>
                                <p className="text-sm text-gray-500">목록에 없지만 특정 상황에서만 반응하나요?</p>
                            </div>

                            <div className="px-8 py-4">
                                <div className="relative group">
                                    <textarea
                                        value={tempInput}
                                        onChange={(e) => setTempInput(e.target.value)}
                                        placeholder="예: 산책 중 특정 강아지를 만났을 때"
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
