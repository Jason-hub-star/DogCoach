import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Brain } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animations/AnimatedCounter";

interface SurveyLoadingProps {
    dogName: string;
}

export function SurveyLoading({ dogName }: SurveyLoadingProps) {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center font-outfit">
            {/* Premium Background Depth (Organic Blobs) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-[-4%] right-[-3%] w-[300px] h-[300px] sm:top-[-10%] sm:right-[-5%] sm:w-[600px] sm:h-[600px] bg-brand-lime/5 rounded-full blur-[64px] sm:blur-[120px] -z-0"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="absolute bottom-[-3%] left-[-2%] w-[260px] h-[260px] sm:bottom-[-10%] sm:left-[-5%] sm:w-[500px] sm:h-[500px] bg-brand-orange/5 rounded-full blur-[56px] sm:blur-[100px] -z-0"
            />

            <div className="container max-w-xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-gray-200/50 border border-white/50 flex flex-col items-center text-center"
                >
                    {/* Pulsing Analyzer Icon */}
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-lime to-green-500 flex items-center justify-center mb-10 shadow-xl shadow-brand-lime/20 relative"
                    >
                        <Brain className="w-12 h-12 text-white" />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-3xl border-2 border-brand-lime"
                        />
                    </motion.div>

                    {/* Header Text */}
                    <div className="mb-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-lime/10 text-brand-lime rounded-full text-xs font-black tracking-widest uppercase mb-6">
                                <Sparkles className="w-3.5 h-3.5" />
                                Deep AI Analysis
                            </span>
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight break-keep tracking-tight">
                            <span className="text-brand-lime">{dogName}</span>의 행동 패턴을<br />
                            고유 알고리즘으로 분석해요
                        </h2>
                        <p className="mt-4 text-gray-500 text-sm md:text-md max-w-sm mx-auto break-keep font-medium leading-relaxed">
                            입력하신 수백 가지의 행동 변수를 바탕으로<br />
                            최적의 맞춤형 솔루션을 설계하고 있습니다.
                        </p>
                    </div>

                    {/* Cinematic Progress Bar */}
                    <div className="w-full max-w-xs mb-12">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Analysis Progress</span>
                            <span className="text-2xl font-black text-brand-lime tabular-nums">
                                <AnimatedCounter value={89} suffix="%" duration={3} />
                            </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "89%" }}
                                transition={{ duration: 4, ease: [0.34, 1.56, 0.64, 1] }}
                                className="h-full bg-gradient-to-r from-brand-lime to-green-400 rounded-full shadow-glow-lime-md relative"
                            >
                                <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Tip Card - Premium Glass */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="w-full bg-gray-50/50 rounded-3xl p-6 flex items-start gap-4 text-left border border-gray-100"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 text-sm mb-1.5">Premium Insight</h4>
                            <p className="text-xs text-gray-600 leading-relaxed break-keep font-medium opacity-80">
                                직접적인 교정보다 환경 변화가 더 효과적일 때가 많아요.
                                테일로그는 행동이 시작되는 '트리거'를 변화시키는 데 집중합니다.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
