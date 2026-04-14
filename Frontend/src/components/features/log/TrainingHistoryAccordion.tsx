"use client";

import { BookOpen, CheckCircle2, SkipForward, Circle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/Accordion";
import { useTrainingHistory, type CurriculumSummary, type StepDetail } from "./useTrainingHistory";

interface TrainingHistoryAccordionProps {
    token: string | null;
}

function StatusIcon({ status }: { status: StepDetail["status"] }) {
    if (status === "COMPLETED") return <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0" />;
    if (status === "SKIPPED_INEFFECTIVE" || status === "SKIPPED_ALREADY_DONE")
        return <SkipForward className="w-4 h-4 text-amber-500 shrink-0" />;
    if (status === "HIDDEN_BY_AI") return <Circle className="w-4 h-4 text-gray-300 shrink-0" />;
    return <Circle className="w-4 h-4 text-gray-200 shrink-0" />;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const colorMap: Record<string, string> = {
        Easy: "bg-green-50 text-green-600 border-green-100",
        Medium: "bg-amber-50 text-amber-600 border-amber-100",
        Hard: "bg-red-50 text-red-600 border-red-100",
    };
    const labelMap: Record<string, string> = {
        Easy: "쉬움",
        Medium: "보통",
        Hard: "어려움",
    };
    return (
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${colorMap[difficulty] || colorMap.Medium}`}>
            {labelMap[difficulty] || difficulty}
        </span>
    );
}

function formatDate(iso: string | null): string {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function CurriculumCard({ summary }: { summary: CurriculumSummary }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-[2rem] shadow-elev-base border border-white/60 ring-1 ring-black/5"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-base font-black text-slate-800 tracking-tight truncate">{summary.courseTitle}</h4>
                    <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={summary.difficulty} />
                        <span className="text-[10px] text-gray-400 font-medium">{summary.totalDays}일 코스</span>
                    </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                    <div className="text-2xl font-black text-brand-lime">{summary.progressPercent}%</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner mb-3">
                <motion.div
                    className="h-full bg-brand-lime rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${summary.progressPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium mb-4">
                {summary.firstActivityAt && (
                    <span>{formatDate(summary.firstActivityAt)} ~ {formatDate(summary.lastActivityAt)}</span>
                )}
                <span className="ml-auto flex gap-2">
                    <span className="text-brand-lime">완료 {summary.completedSteps}</span>
                    {summary.skippedSteps > 0 && <span className="text-amber-500">스킵 {summary.skippedSteps}</span>}
                    {summary.alternativeUsedCount > 0 && <span className="text-purple-500">대안 플랜 {summary.alternativeUsedCount}</span>}
                </span>
            </div>

            {/* Accordion Stages */}
            <Accordion type="multiple" className="space-y-0">
                {summary.stages.map(stage => {
                    const stepsWithStatus = stage.steps.filter(s => s.status !== null).length;
                    const stageStatusIcon = stage.isComplete
                        ? <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0" />
                        : stepsWithStatus > 0
                            ? <div className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0" />
                            : <Circle className="w-4 h-4 text-gray-200 shrink-0" />;

                    return (
                        <AccordionItem key={stage.stageId} value={stage.stageId} className="border-b border-gray-100 last:border-b-0">
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {stageStatusIcon}
                                    <span className="text-xs font-black text-gray-500 shrink-0">{stage.day}일차</span>
                                    <span className="text-xs font-bold text-gray-700 truncate">{stage.title}</span>
                                    <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-auto mr-2">
                                        {stage.completedSteps}/{stage.totalSteps}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2 pl-7">
                                    {stage.steps.map(step => (
                                        <div key={step.stepNumber} className="flex items-start gap-2.5">
                                            <StatusIcon status={step.status} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-700 truncate">{step.title}</span>
                                                    {step.usedAlternative && (
                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                                                            대안 플랜
                                                        </span>
                                                    )}
                                                </div>
                                                {step.completedAt && (
                                                    <span className="text-[10px] text-gray-400">{formatDate(step.completedAt)}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </motion.div>
    );
}

export function TrainingHistoryAccordion({ token }: TrainingHistoryAccordionProps) {
    const { summaries, isLoading, isEmpty } = useTrainingHistory(token);

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <BookOpen className="w-5 h-5 text-brand-lime" />
                <h3 className="text-xl font-black text-slate-800 tracking-tight">훈련 히스토리</h3>
            </div>

            {isLoading && (
                <div className="glass p-8 rounded-[2rem] border border-white/60 ring-1 ring-black/5 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                    <div className="h-2 bg-gray-100 rounded w-full mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
            )}

            {isEmpty && (
                <div className="glass p-8 rounded-[2rem] border border-white/60 ring-1 ring-black/5 text-center">
                    <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400">아직 훈련 기록이 없어요</p>
                    <p className="text-[10px] text-gray-300 mt-1">코칭 플랜을 시작하면 여기에 기록됩니다</p>
                </div>
            )}

            {!isLoading && summaries.map((summary, i) => (
                <CurriculumCard key={summary.courseId} summary={summary} />
            ))}
        </section>
    );
}
