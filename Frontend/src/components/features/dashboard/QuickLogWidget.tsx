import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/ui/Toast";
import { FadeIn } from "@/components/ui/animations/FadeIn";
import { ScaleButton } from "@/components/ui/animations/ScaleButton";
import { useAuth } from "@/hooks/useAuth";
import { useCreateLog } from "@/hooks/useQueries";
import { Zap, Plus, Flame } from "lucide-react";

interface Props {
    dogId: string;
    onLogCreated: (log?: any) => void;
}

export const QuickLogWidget = ({ dogId, onLogCreated }: Props) => {
    const { token } = useAuth();
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" as any });

    // Use Mutation Hook
    const { mutate: createLog } = useCreateLog(dogId, token);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ visible: true, message, type });
    };

    const handleQuickLog = (behavior: string, label: string) => {
        const payload = {
            behavior: behavior,
            intensity: 3, // Default intensity
            is_quick_log: true,
            occurred_at: new Date().toISOString()
        };

        createLog(payload as any, {
            onSuccess: (newLog) => {
                console.log('[QuickLog] onSuccess:', newLog);
                showToast(`${label} 기록이 저장되었습니다!`, "success");
                onLogCreated(newLog);
            },
            onError: (error: any) => {
                console.error('[QuickLog] onError:', error);
                showToast("기록 실패: " + (error.message || "알 수 없는 오류"), "error");
            }
        });
    };

    const actions = [
        { label: "짖음", val: "Barking", icon: "🔊", color: "brand-lime" },
        { label: "입질", val: "Biting", icon: "🦷", color: "brand-orange" },
        { label: "배변실수", val: "Toileting", icon: "💧", color: "brand-orange" },
        { label: "분리불안", val: "Anxiety", icon: "🏠", color: "purple" },
        { label: "흥분", val: "Excitement", icon: "⚡", color: "yellow" },
        { label: "기타", val: "기타", icon: "📝", color: "gray" },
    ];

    return (
        <section className="mb-10">
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em] mb-1">Instant Tracking</span>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand-lime fill-brand-lime" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">빠른 기록</h3>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/40 shadow-sm ring-1 ring-black/5">
                    <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse shadow-glow-lime-sm" />
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active</span>
                </div>
            </div>

            {/* Action Grid with Staggered Animation */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                    }
                }}
                className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4"
            >
                {actions.map((action) => (
                    <QuickLogButton
                        key={action.val}
                        label={action.label}
                        icon={action.icon}
                        onClick={() => handleQuickLog(action.val, action.label)}
                        color={action.color}
                    />
                ))}
            </motion.div>

            <Toast
                message={toast.message}
                isVisible={toast.visible}
                type={toast.type}
                duration={3000}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </section>
    );
}

const QuickLogButton = ({ label, icon, onClick, color }: any) => {
    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 15, stiffness: 200 } }
    };

    const colorVariants: any = {
        "brand-lime": "group-hover:text-brand-lime group-hover:bg-brand-lime/5 group-hover:border-brand-lime/30",
        "brand-orange": "group-hover:text-brand-orange group-hover:bg-brand-orange/5 group-hover:border-brand-orange/30",
        "blue": "group-hover:text-blue-500 group-hover:bg-blue-500/5 group-hover:border-blue-500/30",
        "purple": "group-hover:text-purple-500 group-hover:bg-purple-500/5 group-hover:border-purple-500/30",
        "yellow": "group-hover:text-yellow-500 group-hover:bg-yellow-500/5 group-hover:border-yellow-500/30",
        "gray": "group-hover:text-gray-500 group-hover:bg-gray-500/5 group-hover:border-gray-500/30",
    };

    return (
        <motion.div variants={variants}>
            <ScaleButton
                onClick={onClick}
                scale={0.92}
                className={`group w-full flex flex-col items-center justify-center p-4 rounded-[2rem] glass shadow-elev-soft transition-all h-28 relative overflow-hidden ring-1 ring-black/5 ${colorVariants[color]}`}
            >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />

                <div className="mb-2 text-3xl filter drop-shadow-sm transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    {icon}
                </div>
                <span className="font-black text-[11px] tracking-tight group-hover:tracking-wider transition-all duration-300 text-gray-700">
                    {label}
                </span>

                {/* Corner Plus */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                    <Plus className="w-3 h-3" />
                </div>
            </ScaleButton>
        </motion.div>
    )
}
