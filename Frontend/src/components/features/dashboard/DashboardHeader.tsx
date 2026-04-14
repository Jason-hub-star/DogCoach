import { DashboardData } from "./types";
import { FadeIn } from "@/components/ui/animations/FadeIn";
import { Trophy, Calendar, Sparkles, Dog } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
    data: DashboardData;
}

export const DashboardHeader = ({ data }: Props) => {
    return (
        <FadeIn className="px-6 pt-12 pb-8 relative overflow-hidden">
            {/* Soft Ambient Flourish */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-brand-lime/5 blur-[80px] -z-10 rounded-full" />

            <div className="flex gap-6 items-start mb-10 relative z-10">
                {/* Dog Profile Photo */}
                <Link href="/dog/profile">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ delay: 0.1 }}
                        className="flex-shrink-0 cursor-pointer"
                    >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white/80 shadow-lg ring-1 ring-black/5 hover:border-brand-lime/50 hover:shadow-xl hover:shadow-brand-lime/10 transition-all duration-300">
                            {data.dog_profile.profile_image_url ? (
                                <img
                                    src={data.dog_profile.profile_image_url}
                                    alt={data.dog_profile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-brand-lime/20 to-emerald-100 flex items-center justify-center">
                                    <Dog className="w-10 h-10 sm:w-12 sm:h-12 text-brand-lime" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </Link>

                {/* Greeting Text */}
                <div className="flex-1 flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 backdrop-blur-md text-brand-lime rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/60 shadow-sm ring-1 ring-black/5 w-fit"
                    >
                        <Sparkles className="w-3.5 h-3.5 fill-brand-lime/20" />
                        Insight Dashboard
                    </motion.div>
                    <h1 className="text-4xl font-black text-slate-800 leading-[1.1] tracking-tight">
                        반가워요, <br />
                        <span className="bg-gradient-to-r from-brand-lime to-emerald-500 bg-clip-text text-transparent">{data.dog_profile.name}</span> <span className="text-gray-300 font-medium">보호자님</span>
                    </h1>
                </div>
            </div>

            {/* Stats Row with Premium Cards */}
            <div className="flex gap-4 sm:gap-6 relative z-10 max-w-4xl">
                <motion.div
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="glass p-6 rounded-[2.5rem] flex-1 shadow-elev-base border border-white/60 relative overflow-hidden group ring-1 ring-black/5"
                >
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative flex flex-col items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center border border-orange-200/30">
                            <Trophy className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">연속 실천</div>
                            <div className="text-3xl font-black text-slate-800 tabular-nums">
                                {data.stats.current_streak} <span className="text-sm font-bold text-gray-400">Days</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="glass p-6 rounded-[2.5rem] flex-1 shadow-elev-base border border-white/60 relative overflow-hidden group ring-1 ring-black/5"
                >
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand-lime/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative flex flex-col items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-lime/10 flex items-center justify-center border border-brand-lime/20">
                            <Calendar className="w-5 h-5 text-brand-lime" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">누적 기록</div>
                            <div className="text-3xl font-black text-slate-800 tabular-nums">
                                {data.stats.total_logs} <span className="text-sm font-bold text-gray-400">Total</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </FadeIn>
    );
};
