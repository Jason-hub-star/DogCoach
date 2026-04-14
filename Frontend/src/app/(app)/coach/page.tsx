"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChallengeJourneyMap } from "@/components/features/coach/ChallengeJourneyMap";
import { MissionActionOverlay } from "@/components/features/coach/MissionActionOverlay";
import { Zap, ChevronRight, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TRAINING_CURRICULUM, TrainingStage, mapIssueToCurriculum } from "@/data/curriculum";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useQueries";

export default function CoachPage() {
    const { token, user, loading: isAuthLoading, hasStoredSessionHint } = useAuth();
    const router = useRouter();
    const [shouldHighlight, setShouldHighlight] = useState(false);
    const [entrySource, setEntrySource] = useState<string>("coach");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        setShouldHighlight(params.get("highlight") === "true");
        setEntrySource(params.get("from") || "coach");
    }, []);

    const isAuthHydratingFromStorage = !isAuthLoading && !token && !user && hasStoredSessionHint;
    const isDashboardQueryEnabled = !isAuthHydratingFromStorage && !isAuthLoading && (!!token || !user || !!user.is_anonymous);
    const { data: dashboardData } = useDashboardData(isDashboardQueryEnabled, token, true);
    const dogId = dashboardData?.dog_profile?.id;

    const [currentCourseId, setCurrentCourseId] = useState<string>(TRAINING_CURRICULUM[0].id);
    const [currentDay] = useState(1);
    const [selectedMission, setSelectedMission] = useState<TrainingStage | null>(null);

    const currentCourse = TRAINING_CURRICULUM.find((course) => course.id === currentCourseId) || TRAINING_CURRICULUM[0];
    const recommendedCourse = dashboardData ? mapIssueToCurriculum(dashboardData.issues) : null;

    useEffect(() => {
        if (recommendedCourse) {
            setCurrentCourseId(recommendedCourse.id);
        }
    }, [recommendedCourse?.id]);

    useEffect(() => {
        if (shouldHighlight && recommendedCourse) {
            const element = document.getElementById("training-list");
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [shouldHighlight, recommendedCourse]);

    const handleMissionComplete = (reaction: string) => {
        setSelectedMission(null);

        // Keep post-completion navigation consistent with entry source.
        if (entrySource === "log") {
            router.push("/log?trainingSaved=1&tab=analytics");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <header className="bg-white/80 backdrop-blur-md p-6 border-b border-gray-100 sticky top-0 z-30">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-slate-800 leading-tight">훈련 아카데미</h1>
                    {shouldHighlight && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] font-black text-brand-lime-darker tracking-tight"
                        >
                            {dashboardData?.dog_profile.name} 맞춤 과정이 추천되었습니다.
                        </motion.span>
                    )}
                </div>
            </header>

            <main className="container mx-auto max-w-lg px-4">
                <AnimatePresence mode="wait">
                    <motion.section
                        key={currentCourseId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="py-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                                </div>
                                <h2 className="font-black text-slate-800 text-lg">진행 중인 챌린지</h2>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 border mb-8 relative overflow-hidden group transition-all duration-500",
                                currentCourseId === recommendedCourse?.id ? "border-brand-lime ring-4 ring-brand-lime/10" : "border-gray-100"
                            )}
                        >
                            <div className="absolute right-0 top-0 p-4 opacity-5">
                                <Sparkles className="w-24 h-24 text-brand-lime" />
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-black text-slate-800 leading-tight">{currentCourse.title}</h3>
                                {currentCourseId === recommendedCourse?.id && (
                                    <span className="bg-brand-lime text-[9px] font-black px-2 py-0.5 rounded text-black uppercase tracking-tighter">추천</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium relative z-10 break-keep mb-6">{currentCourse.description}</p>

                            <ChallengeJourneyMap
                                stages={currentCourse.stages}
                                currentDay={currentDay}
                                unlockMode="all"
                                onDayClick={(stage) => setSelectedMission(stage)}
                            />
                        </div>
                    </motion.section>
                </AnimatePresence>

                <section className="pb-12" id="training-list">
                    <div className="flex items-center justify-between mb-5 px-1">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <h2 className="font-black text-slate-800">모든 훈련 프로그램</h2>
                        </div>
                        <span className="text-xs font-bold text-gray-400">{TRAINING_CURRICULUM.length}</span>
                    </div>

                    <div className="space-y-4">
                        {TRAINING_CURRICULUM.map((course) => (
                            <CourseCard
                                key={course.id}
                                title={course.title}
                                duration={`${course.total_days}일 완성`}
                                active={currentCourseId === course.id}
                                recommended={recommendedCourse?.id === course.id}
                                onClick={() => {
                                    setCurrentCourseId(course.id);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                highlighted={shouldHighlight && recommendedCourse?.id === course.id}
                            />
                        ))}
                    </div>
                </section>
            </main>

            <MissionActionOverlay
                isOpen={!!selectedMission}
                curriculumId={currentCourseId}
                dogId={dogId}
                mission={selectedMission}
                onClose={() => setSelectedMission(null)}
                onComplete={handleMissionComplete}
            />
        </div>
    );
}

function CourseCard({
    title,
    duration,
    active,
    recommended,
    onClick,
    highlighted,
}: {
    title: string;
    duration: string;
    active?: boolean;
    recommended?: boolean;
    onClick?: () => void;
    highlighted?: boolean;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "p-5 rounded-3xl border flex items-center justify-between cursor-pointer transition-all duration-500 group relative overflow-hidden",
                active
                    ? "bg-slate-800 border-slate-800 shadow-xl shadow-gray-200 text-white"
                    : "bg-white border-gray-100 shadow-sm hover:border-brand-lime/30",
                recommended && !active && "border-brand-lime ring-2 ring-brand-lime/10",
                highlighted && "ring-4 ring-brand-lime/20 scale-[1.02] -translate-y-1 shadow-brand-lime/10"
            )}
        >
            {recommended && (
                <div className="absolute top-0 right-0 z-10">
                    <motion.div
                        animate={highlighted ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="bg-brand-lime text-black text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-sm"
                    >
                        BEST 추천
                    </motion.div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                        active ? "bg-brand-lime text-slate-800" : "bg-brand-lime/10 text-brand-lime"
                    )}
                >
                    {active ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                    <div className={cn("font-black text-base mb-0.5 transition-colors", active ? "text-white" : "text-slate-800 group-hover:text-brand-lime")}>{title}</div>
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-brand-lime/70" : "text-gray-400")}>{duration}</div>
                </div>
            </div>
            {!active && (
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-lime group-hover:text-white transition-all text-gray-300">
                    <ChevronRight className="w-5 h-5" />
                </div>
            )}
        </motion.div>
    );
}
