"use client";
import { SurveyData } from "./types";
import { cn } from "@/lib/utils";
import { Building2, Home, Users, Plus, X, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    data: SurveyData;
    updateData: (newData: Partial<SurveyData>) => void;
}

export function Step2Environment({ data, updateData }: Props) {
    const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
    const [tempInput, setTempInput] = useState("");

    const handleFamilyToggle = (member: string) => {
        const current = data.familyMembers;
        if (current.includes(member)) {
            updateData({ familyMembers: current.filter(m => m !== member) });
        } else {
            updateData({ familyMembers: [...current, member] });
        }
    };

    const handleCarerToggle = (carer: string) => {
        if (carer === 'etc') {
            setTempInput(data.primaryCarerOther || "");
            setIsOtherModalOpen(true);
            return;
        }

        const current = data.primaryCarer;
        if (current.includes(carer)) {
            updateData({ primaryCarer: current.filter(c => c !== carer) });
        } else {
            updateData({ primaryCarer: [...current, carer] });
        }
    };

    const handleSaveOther = () => {
        const current = data.primaryCarer;
        if (tempInput.trim()) {
            updateData({
                primaryCarer: current.includes('etc') ? current : [...current, 'etc'],
                primaryCarerOther: tempInput.trim()
            });
        } else {
            updateData({
                primaryCarer: current.filter(c => c !== 'etc'),
                primaryCarerOther: ""
            });
        }
        setIsOtherModalOpen(false);
    };

    const carerOptions = ['본인', '어머니', '아버지', '배우자', '자녀'];

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">어떤 환경에서 지내나요?</h2>
                <p className="text-gray-500">주거 형태와 가족 구성원은 행동 교정의 중요한 요소입니다.</p>
            </div>

            {/* Household Type */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">주거 형태</label>
                <div className="grid grid-cols-2 gap-4">
                    <SelectCard
                        icon={<Building2 className="w-8 h-8 mb-2" />}
                        label="아파트 / 빌라"
                        selected={data.householdType === 'APARTMENT'}
                        onClick={() => updateData({ householdType: 'APARTMENT' })}
                    />
                    <SelectCard
                        icon={<Home className="w-8 h-8 mb-2" />}
                        label="주택 / 마당 있음"
                        selected={data.householdType === 'HOUSE'}
                        onClick={() => updateData({ householdType: 'HOUSE' })}
                    />
                </div>
            </div>

            {/* Family Members */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">함께 사는 가족 (중복 선택)</label>
                <div className="grid grid-cols-2 gap-3">
                    {['1인 가구', '부부/커플', '자녀 있음', '다른 반려동물'].map((member) => (
                        <button
                            key={member}
                            onClick={() => handleFamilyToggle(member)}
                            className={cn(
                                "p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                                data.familyMembers.includes(member)
                                    ? "border-brand-lime bg-green-50 text-brand-lime font-bold shadow-sm"
                                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                            )}
                        >
                            <Users className="w-5 h-5 opacity-50" />
                            <span className="text-sm">{member}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Primary Carer (Enhanced) */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">누가 아이를 주로 돌보나요? (다중 선택)</label>
                <div className="grid grid-cols-3 gap-3">
                    {carerOptions.map((carer) => (
                        <button
                            key={carer}
                            onClick={() => handleCarerToggle(carer)}
                            className={cn(
                                "p-3 rounded-xl border text-center transition-all text-sm",
                                data.primaryCarer.includes(carer)
                                    ? "border-brand-lime bg-brand-lime text-white font-bold shadow-md"
                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                            )}
                        >
                            {carer}
                        </button>
                    ))}
                    {/* Other Option */}
                    <button
                        onClick={() => handleCarerToggle('etc')}
                        className={cn(
                            "p-3 rounded-xl border text-center transition-all text-sm flex items-center justify-center gap-1",
                            data.primaryCarer.includes('etc')
                                ? "border-brand-lime bg-brand-lime text-white font-bold shadow-md"
                                : "border-gray-200 border-dashed hover:border-gray-400 text-gray-400"
                        )}
                    >
                        {data.primaryCarer.includes('etc') && data.primaryCarerOther ? (
                            <span className="truncate max-w-full px-1">{data.primaryCarerOther}</span>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>직접 입력</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Premium Other Modal */}
            <AnimatePresence>
                {isOtherModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOtherModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden relative shadow-2xl border border-gray-100 z-10"
                        >
                            <div className="p-8 pb-4 text-center">
                                <h3 className="text-xl font-black text-slate-800 mb-2">양육자 직접 입력</h3>
                                <p className="text-sm text-gray-500">
                                    아이를 돌보는 특별한 분이 계신가요?<br />(예: 할머니, 삼촌, 펫시터 등)
                                </p>
                            </div>

                            <div className="px-8 py-4">
                                <div className="relative group">
                                    <textarea
                                        value={tempInput}
                                        onChange={(e) => setTempInput(e.target.value)}
                                        placeholder="어떤 분인가요?"
                                        className="w-full h-24 p-5 rounded-2xl bg-gray-50 border-transparent focus:border-brand-lime focus:bg-white focus:ring-4 focus:ring-brand-lime/10 outline-none transition-all text-sm resize-none font-medium"
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
                                    onClick={() => setIsOtherModalOpen(false)}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-all text-sm"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveOther}
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

function SelectCard({ icon, label, selected, onClick }: { icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all h-32",
                selected
                    ? "border-brand-lime bg-green-50 text-brand-lime shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-300 text-gray-400"
            )}
        >
            {icon}
            <span className={cn("font-bold text-sm", selected ? "text-brand-dark" : "text-gray-600")}>{label}</span>
        </button>
    );
}
