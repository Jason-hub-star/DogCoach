import { motion, AnimatePresence } from "framer-motion";
import { RecentLog } from "./types";
import { Clock, ChevronRight, History, Calendar, Plus } from "lucide-react";
import { translate } from "@/lib/localization";

interface Props {
    logs: RecentLog[];
    onLogUpdated: () => void;
    onEditLog: (log: RecentLog) => void;
}

export const RecentLogList = ({ logs, onLogUpdated, onEditLog }: Props) => {
    // Simple icon mapper
    const getIcon = (behavior: string) => {
        if (behavior.includes("Barking") || behavior === "짖음") return "🔊";
        if (behavior.includes("Biting") || behavior === "입질") return "🦷";
        if (behavior.includes("Toileting") || behavior === "배변") return "💧";
        if (behavior.includes("Anxiety") || behavior === "분리불안") return "🏠";
        if (behavior.includes("Excitement") || behavior === "흥분") return "⚡";
        return "📝";
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return `${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <section className="pb-24">
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Timeline</span>
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">최근 기록</h3>
                    </div>
                </div>
                {logs.length > 0 && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] font-black text-brand-lime uppercase tracking-widest bg-brand-lime/10 px-3 py-1 rounded-full ring-1 ring-brand-lime/10 shadow-sm"
                    >
                        {logs.length}개 기록됨
                    </motion.span>
                )}
            </div>

            <div className="space-y-4">
                <AnimatePresence initial={false} mode="sync">
                    {logs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0, transition: { type: "spring", damping: 20, stiffness: 100 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        >
                            <button
                                onClick={() => onEditLog(log)}
                                className="w-full glass p-5 rounded-[2.5rem] shadow-elev-soft border border-white/40 flex items-center justify-between hover-shadow-elev-hover hover:border-brand-lime/30 transition-all active:scale-[0.98] text-left group ring-1 ring-black/5"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white/40 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inset-soft border border-white/60 group-hover:bg-brand-lime/10 group-hover:scale-110 transition-all duration-500">
                                        {getIcon(log.behavior)}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-800 text-lg mb-1 tracking-tight">{translate(log.behavior)}</div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight">
                                                <Clock className="w-3.5 h-3.5 opacity-60" />
                                                {formatDate(log.occurred_at)}
                                            </div>
                                            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                            <div className="text-[10px] font-black text-brand-lime uppercase tracking-widest px-2.5 py-1 bg-brand-lime/5 rounded-full ring-1 ring-brand-lime/20">
                                                강도 {log.intensity}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-full bg-white/40 border border-white/60 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-brand-lime group-hover:scale-110 shadow-sm transition-all duration-300">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {logs.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 glass rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner group transition-colors hover:border-brand-lime/20"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-black text-gray-400 text-lg tracking-tight">로그 데이터가 아직 없네요</p>
                        <p className="text-xs mt-2 font-bold uppercase tracking-widest text-gray-400 opacity-60">첫 기록을 남겨보세요!</p>
                    </motion.div>
                )}
            </div>
        </section>
    );
};
