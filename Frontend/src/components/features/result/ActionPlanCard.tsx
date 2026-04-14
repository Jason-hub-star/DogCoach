import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, LucideIcon, Play, Lock } from "lucide-react";

interface ActionPlanCardProps {
    stage: {
        title: string;
        goal: string;
        icon: LucideIcon;
    };
    onStart: () => void;
    isLocked?: boolean;
}

export function ActionPlanCard({ stage, onStart, isLocked = false }: ActionPlanCardProps) {
    const Icon = stage.icon || CheckCircle2;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pb-10 font-outfit"
        >
            <div className={`
                relative overflow-hidden group
                ${isLocked
                    ? 'bg-gray-50/50 backdrop-blur-sm border-gray-100'
                    : 'bg-white/60 backdrop-blur-3xl border-white shadow-2xl shadow-gray-200/50'}
                rounded-[2.5rem] p-8 md:p-10 border
            `}>
                {/* Visual Flair */}
                {!isLocked && (
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-lime/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                )}

                <div className="flex items-center gap-3 mb-6">
                    <div className={`
                        p-3 rounded-2xl shadow-lg
                        ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-slate-800 text-brand-lime'}
                    `}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI Daily Mission</span>
                        <h3 className="font-black text-slate-800 text-xl tracking-tight">맞춤형 오늘의 솔루션</h3>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black text-brand-lime-darker bg-brand-lime/10 px-3 py-1 rounded-full uppercase tracking-widest border border-brand-lime/20">
                            Action Phase 01
                        </span>
                        {isLocked && (
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Locked
                            </span>
                        )}
                    </div>
                    <h4 className={`text-2xl font-black mb-2 break-keep tracking-tight ${isLocked ? 'text-gray-400' : 'text-slate-800'}`}>
                        {stage.title}
                    </h4>
                    <p className={`text-sm break-keep leading-relaxed font-medium ${isLocked ? 'text-gray-300' : 'text-gray-500 opacity-80'}`}>
                        {stage.goal}
                    </p>
                </div>

                <button
                    onClick={onStart}
                    className={`
                        w-full py-5 rounded-[1.5rem] font-black text-md transition-all flex items-center justify-center gap-2 group active:scale-[0.98]
                        ${isLocked
                            ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            : 'bg-slate-800 hover:bg-slate-900 text-brand-lime shadow-xl shadow-gray-200'}
                    `}
                >
                    <span className="relative z-10">{isLocked ? "로그인하고 시작하기" : "지금 바로 훈련 시작하기"}</span>
                    {isLocked ? (
                        <Lock className="w-5 h-5 opacity-50" />
                    ) : (
                        <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
                    )}
                </button>
            </div>
        </motion.div>
    );
}
