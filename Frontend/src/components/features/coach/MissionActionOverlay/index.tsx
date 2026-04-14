import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Sparkles, Wand2, Search } from "lucide-react";
import { TrainingStage } from "../../../../data/curriculum/types";
import { Button } from "@/components/ui/Button";
import { ScaleButton } from "@/components/ui/animations/ScaleButton";
import { useMissionAction } from "./useMissionAction";
import { MissionSuccessView } from "./MissionSuccessView";

function ScanningBar() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <motion.div
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-glow-purple-strong z-10"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500/20"
            />
        </div>
    );
}

interface MissionActionOverlayProps {
    isOpen: boolean;
    curriculumId: string | null;
    dogId?: string | null;
    mission: TrainingStage | null;
    onClose?: () => void;
    onComplete: (reaction: string) => void;
}

export function MissionActionOverlay({ isOpen, curriculumId, dogId, mission, onClose, onComplete }: MissionActionOverlayProps) {
    const {
        currentStep,
        isCompleted,
        swapping,
        isPending,
        isLoadingCOption,
        showVault,
        setShowVault,
        handleNext,
        handleBack,
        handleIneffective,
        handleConfirmSwap,
        handleReaction,
        cancelSwap,
        getSelectedAlternative,
        canRequestAlternative,
    } = useMissionAction({ curriculumId, dogId, mission, onComplete, isOpen });

    if (!isOpen || !mission) return null;

    const totalSteps = mission.steps.length;
    const step = mission.steps[currentStep];
    const selectedAlternative = getSelectedAlternative(step.step_number);
    const planLabel = selectedAlternative ? `Plan ${selectedAlternative.id}` : "Plan A";
    const showAlternativeActions = !!selectedAlternative;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                key={mission.id}
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] w-full max-w-sm md:max-w-md overflow-hidden relative max-h-[90vh] flex flex-col shadow-2xl border border-gray-100"
            >
                <div className="p-8 pb-5 bg-gradient-to-b from-brand-lime/10 to-white shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <span className="px-3 py-1 bg-brand-lime text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm shadow-brand-lime/20">
                            Day {mission.day} Mission
                        </span>
                        <div className="flex gap-1.5">
                            {mission.steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? "w-8 bg-brand-lime" : "w-1.5 bg-gray-200"}`}
                                />
                            ))}
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 leading-tight break-keep mb-2">{mission.title}</h1>
                    <p className="text-sm text-gray-500 leading-relaxed break-keep font-medium">{mission.goal}</p>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <AnimatePresence mode="wait">
                        {!isCompleted ? (
                            <motion.div
                                key={selectedAlternative ? `step-${currentStep}-alt-${selectedAlternative.id}` : `step-${currentStep}-plan-a`}
                                initial={swapping ? { rotateY: 90, opacity: 0 } : { x: 20, opacity: 0 }}
                                animate={{ rotateY: 0, x: 0, opacity: 1 }}
                                exit={{ rotateY: -90, x: -20, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4 py-4 relative">
                                    <div className={`w-14 h-14 ${selectedAlternative ? "bg-purple-600" : "bg-brand-lime"} text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${selectedAlternative ? "shadow-purple-200" : "shadow-brand-lime/30"} transition-all duration-500 relative overflow-hidden`}>
                                        {swapping ? <Search className="w-6 h-6 animate-pulse" /> : (selectedAlternative ? selectedAlternative.id : currentStep + 1)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-extrabold transition-colors duration-500 ${selectedAlternative ? "text-purple-700" : "text-gray-800"}`}>
                                            {swapping ? "대안을 준비중입니다..." : (selectedAlternative ? selectedAlternative.title : step.title)}
                                        </h3>
                                        <div className={`flex items-center gap-1 text-[10px] ${selectedAlternative ? "text-purple-600" : "text-brand-lime"} font-black uppercase transition-colors duration-500`}>
                                            {swapping ? <Wand2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            {swapping ? "Analyzing" : `${planLabel} Guide`}
                                        </div>
                                    </div>
                                </div>

                                <div className={`group bg-gray-50 rounded-2xl p-6 border transition-all duration-700 relative overflow-hidden ${selectedAlternative ? "border-purple-200 bg-purple-50/30" : "border-gray-100"}`}>
                                    {(swapping || isLoadingCOption) && <ScanningBar />}
                                    <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-700 ${selectedAlternative ? "bg-purple-600" : "bg-brand-lime"} opacity-30`} />
                                    <p className={`italic leading-relaxed text-sm transition-all duration-500 ${swapping ? "blur-sm opacity-50" : "opacity-100"}`}>
                                        "{selectedAlternative ? selectedAlternative.description : step.description}"
                                    </p>
                                </div>

                                {!selectedAlternative && (
                                    <div className="bg-brand-lime/10 rounded-2xl p-4 flex gap-3 items-start border border-brand-lime/20">
                                        <div className="w-5 h-5 bg-brand-lime rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-lime uppercase tracking-tighter mb-1">Success Criteria</p>
                                            <p className="text-sm text-slate-800 font-bold leading-snug">{step.success_criteria}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedAlternative && (
                                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-tight mb-1">Tip</p>
                                        <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                            더 짧게, 더 자주 반복하면서 성공 기준을 낮추면 반응 안정화에 유리합니다.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    {showAlternativeActions ? (
                                        <>
                                            {currentStep > 0 && (
                                                <ScaleButton asChild className="flex-1">
                                                    <Button onClick={handleBack} variant="secondary" className="w-full rounded-2xl py-6 gap-2 border-gray-200">
                                                        <ArrowLeft className="w-4 h-4" />
                                                        이전
                                                    </Button>
                                                </ScaleButton>
                                            )}
                                            <ScaleButton asChild className={currentStep === 0 ? "w-full" : "flex-[2] min-w-0"}>
                                                <Button
                                                    onClick={handleConfirmSwap}
                                                    disabled={isPending || swapping}
                                                    variant="brand"
                                                    className="w-full bg-purple-600 hover:bg-purple-700 rounded-2xl py-6 text-lg font-black gap-2 shadow-xl shadow-purple-200 disabled:opacity-70"
                                                >
                                                    {isPending ? (
                                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                                            <Wand2 className="w-5 h-5" />
                                                        </motion.div>
                                                    ) : (
                                                        <>
                                                            <span className="truncate">{currentStep === totalSteps - 1 ? `${planLabel}로 완료` : `${planLabel}로 다음`}</span>
                                                            <ArrowRight className="w-5 h-5 shrink-0" />
                                                        </>
                                                    )}
                                                </Button>
                                            </ScaleButton>
                                        </>
                                    ) : (
                                        <>
                                            {currentStep > 0 && (
                                                <ScaleButton asChild className="flex-1">
                                                    <Button onClick={handleBack} variant="secondary" className="w-full rounded-2xl py-6 gap-2 border-gray-200">
                                                        <ArrowLeft className="w-4 h-4" />
                                                        이전
                                                    </Button>
                                                </ScaleButton>
                                            )}
                                            <ScaleButton asChild className={currentStep === 0 ? "w-full" : "flex-[2] min-w-0"}>
                                                <Button onClick={handleNext} disabled={swapping || isPending} variant="brand" className="w-full rounded-2xl py-6 text-lg font-black gap-2 shadow-xl shadow-brand-lime/20">
                                                    <span className="truncate">{currentStep === totalSteps - 1 ? "미션 완료" : "다음 단계로"}</span>
                                                    <ArrowRight className="w-5 h-5 shrink-0" />
                                                </Button>
                                            </ScaleButton>
                                        </>
                                    )}
                                </div>

                                {canRequestAlternative(step.step_number) && (
                                    <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">다른 방법이 필요하신가요?</p>
                                        <ScaleButton
                                            onClick={handleIneffective}
                                            disabled={swapping || isPending || isLoadingCOption}
                                        >
                                            <div className="w-full p-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-brand-lime/30 rounded-2xl flex items-center gap-4 transition-all group active:scale-95">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                                    {(isPending || isLoadingCOption) ? (
                                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                                            <Wand2 className="w-4 h-4 text-brand-lime" />
                                                        </motion.div>
                                                    ) : (
                                                        <Search className="w-5 h-5 text-gray-400 group-hover:text-brand-lime" />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-bold text-gray-700 group-hover:text-slate-800">다른 접근으로 바꿔볼까요?</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{selectedAlternative ? "다음 대안으로 전환합니다." : "대안 훈련으로 전환합니다."}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-lime group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </ScaleButton>
                                    </div>
                                )}

                                {selectedAlternative && (
                                    <div className="pt-6 border-t border-gray-100 space-y-4">
                                        <button
                                            onClick={() => setShowVault(!showVault)}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                                        >
                                            <Search className="w-3 h-3" />
                                            {showVault ? "Plan A 숨기기" : "Plan A 보기"}
                                        </button>

                                        <AnimatePresence>
                                            {showVault && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">원래 계획 (Plan A)</p>
                                                        <p className="text-xs font-bold text-gray-700 mb-1">{step.title}</p>
                                                        <p className="text-[10px] text-gray-500 leading-relaxed italic">"{step.description}"</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            onClick={() => cancelSwap(step.step_number)}
                                            disabled={swapping}
                                            className="w-full text-xs text-gray-400 font-medium hover:text-gray-600 underline decoration-gray-300 underline-offset-4 disabled:opacity-30 pb-2"
                                        >
                                            대안 취소하고 Plan A로 돌아가기
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <MissionSuccessView onReaction={handleReaction} />
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full py-2 text-gray-400 text-[10px] font-black text-center hover:text-gray-600 transition-colors uppercase tracking-widest"
                >
                    닫기
                </button>
            </motion.div>
        </div>
    );
}

export default MissionActionOverlay;
