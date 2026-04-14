import { useState } from "react";
import { motion } from "framer-motion";
import { translate } from "@/lib/localization";
import { useAuth } from "@/hooks/useAuth";
import { useCreateLog } from "@/hooks/useQueries";
import { X, Info, Sparkles, Calendar, Clock, RotateCcw } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreate: () => void;
    envTriggers: string[];
    envConsequences: string[];
    dogId: string;
}

// Simple Chip Component
const TagChip = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ring-1 ring-inset uppercase tracking-widest ${selected
            ? "bg-slate-800 text-brand-lime ring-gray-900 shadow-lg shadow-gray-200 scale-105"
            : "bg-white text-gray-400 ring-gray-100 hover:ring-brand-lime/30 hover:text-slate-800 hover:bg-gray-50"
            }`}
    >
        {label}
    </button>
);

export const CreateLogDialog = ({ open, onClose, onCreate, envTriggers, envConsequences, dogId }: Props) => {
    const { token } = useAuth();
    const { mutate: createLog, isPending } = useCreateLog(dogId, token);

    // Initialize with default values
    const now = new Date();
    const [behavior, setBehavior] = useState<string>("기타");
    const [intensity, setIntensity] = useState<number>(5);
    const [antecedent, setAntecedent] = useState<string>("");
    const [consequence, setConsequence] = useState<string>("");
    const [occurredAtDate, setOccurredAtDate] = useState<string>(now.toISOString().split('T')[0]);
    const [occurredAtTime, setOccurredAtTime] = useState<string>(now.toTimeString().split(' ')[0].substring(0, 5));

    if (!open) return null;

    const handleSave = () => {
        if (!token) return;

        // Combine date and time
        const combinedDateTime = new Date(`${occurredAtDate}T${occurredAtTime}`).toISOString();

        createLog({
            behavior,
            intensity,
            antecedent,
            consequence,
            occurred_at: combinedDateTime
        }, {
            onSuccess: () => {
                onCreate();
            },
            onError: (error) => {
                alert("생성 실패: " + error.message);
            }
        });
    };

    // Mapping isPending to isSaving for UI compatibility
    const isSaving = isPending;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="bg-white w-full max-w-sm max-h-[92dvh] rounded-[2rem] p-5 shadow-elev-modal border border-gray-100 relative overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-slate-800 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-brand-lime" />
                    <h3 className="text-lg font-black text-slate-800">상세 기록 추가</h3>
                </div>

                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    정확한 패턴 분석
                </p>

                <div className="space-y-4 mb-4">
                    {/* Time Section */}
                    <div>
                        <div className="flex justify-between items-end mb-1.5">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">시간</label>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    setOccurredAtDate(now.toISOString().split('T')[0]);
                                    setOccurredAtTime(now.toTimeString().split(' ')[0].substring(0, 5));
                                }}
                                className="text-[10px] font-bold text-brand-lime flex items-center gap-1 hover:bg-brand-lime/5 px-2 py-0.5 rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                지금 시간으로
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-[2] relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={occurredAtDate}
                                    onChange={(e) => setOccurredAtDate(e.target.value)}
                                    className="w-full text-xs font-bold pl-8 pr-2 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-lime/50 transition-all font-mono"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <input
                                    type="time"
                                    value={occurredAtTime}
                                    onChange={(e) => setOccurredAtTime(e.target.value)}
                                    className="w-full text-xs font-bold pl-8 pr-2 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-lime/50 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Antecedent Section */}
                    <div>
                        <div className="flex justify-between items-end mb-1.5">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">상황</label>
                                <span className="text-[10px] font-bold text-gray-400">원인 / 상황</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {envTriggers.map((tag) => (
                                <TagChip
                                    key={tag}
                                    label={translate(tag)}
                                    selected={antecedent === translate(tag) || antecedent === tag}
                                    onClick={() => setAntecedent(antecedent === translate(tag) || antecedent === tag ? "" : translate(tag))}
                                />
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="상황을 직접 입력해주세요..."
                            value={antecedent}
                            onChange={(e) => setAntecedent(translate(e.target.value))}
                            className="w-full text-sm font-bold px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-lime/50 transition-all shadow-inner"
                        />
                    </div>

                    {/* Behavior Section */}
                    <div className="bg-gradient-to-br from-brand-lime/10 to-brand-lime/5 p-4 rounded-2xl border border-brand-lime/10 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/40 rounded-full blur-xl" />

                        <div className="flex justify-between items-center mb-1 relative z-10">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded">행동</label>
                            <div className="text-[10px] font-black text-brand-lime uppercase tracking-widest px-2 py-0.5 bg-slate-800 rounded-lg shadow-sm">
                                강도 {intensity}
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="행동을 입력해주세요..."
                            value={behavior}
                            onChange={(e) => setBehavior(e.target.value)}
                            className="w-full text-base font-black text-slate-800 mb-2 relative z-10 px-1 bg-transparent border-b-2 border-gray-200 focus:border-brand-lime focus:outline-none transition-colors"
                        />

                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={intensity}
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/50 rounded-lg appearance-none cursor-pointer accent-brand-lime mb-1"
                        />
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            <span>약함</span>
                            <span>심함</span>
                        </div>
                    </div>

                    {/* Consequence Section */}
                    <div>
                        <div className="flex justify-between items-end mb-1.5">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">대처</label>
                                <span className="text-[10px] font-bold text-brand-lime">나의 대처</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {envConsequences.map((tag) => (
                                <TagChip
                                    key={tag}
                                    label={translate(tag)}
                                    selected={consequence === translate(tag) || consequence === tag}
                                    onClick={() => setConsequence(consequence === translate(tag) || consequence === tag ? "" : translate(tag))}
                                />
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="대처 방법을 기록해주세요..."
                            value={consequence}
                            onChange={(e) => setConsequence(e.target.value)}
                            className="w-full text-sm font-bold px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-lime/50 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3.5 bg-slate-800 text-brand-lime font-black rounded-2xl active:scale-95 transition-all shadow-xl shadow-gray-200 disabled:opacity-50 text-sm"
                >
                    {isSaving ? "저장 중..." : "기록 완료"}
                </button>
            </motion.div>
        </motion.div>
    );
};
