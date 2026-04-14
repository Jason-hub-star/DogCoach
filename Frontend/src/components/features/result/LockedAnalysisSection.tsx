import { Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LockedSectionProps {
    title: string;
    description?: string;
    bgClass?: string;
}

export function LockedAnalysisSection({ title, description, bgClass }: LockedSectionProps) {
    return (
        <section className={cn(
            "relative px-8 py-10 overflow-hidden bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl shadow-gray-200/30 font-outfit transition-all group hover:bg-white/60",
            bgClass
        )}>
            {/* Header (Visible) */}
            <div className="relative z-20 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100/80 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200/50">
                        <Lock className="w-3 h-3" />
                        <span>Member Only</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-brand-orange/10 text-brand-orange opacity-40">
                        <Crown className="w-4 h-4" />
                    </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 break-keep tracking-tight group-hover:text-brand-lime transition-colors">{title}</h3>
                {description && <p className="text-gray-400 text-sm mt-2 break-keep font-medium opacity-80 leading-relaxed">{description}</p>}
            </div>

            {/* Blurred Content Placeholder - Cinematic */}
            <div className="relative">
                <div className="space-y-4 filter blur-xl select-none opacity-20 pointer-events-none scale-95 origin-top transition-transform group-hover:scale-100">
                    <div className="h-6 bg-gray-200 rounded-2xl w-3/4" />
                    <div className="h-6 bg-gray-200 rounded-2xl w-full" />
                    <div className="h-6 bg-gray-200 rounded-2xl w-5/6" />

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="h-32 bg-gray-100 rounded-[2rem]" />
                        <div className="h-32 bg-gray-100 rounded-[2rem]" />
                    </div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 pointer-events-none" />
            </div>
        </section>
    );
}
