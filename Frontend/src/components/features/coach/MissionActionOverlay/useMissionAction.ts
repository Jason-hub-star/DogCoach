import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { TrainingStage, TrainingAlternative, TrainingStep } from "../../../../data/curriculum/types";
import { useAuth } from "@/hooks/useAuth";
import { useFetchCAlternative, useUpdateTrainingStatus } from "@/hooks/useQueries";
import { CONFETTI_COLORS } from "@/lib/theme/colors";

interface UseMissionActionProps {
    curriculumId: string | null;
    dogId?: string | null;
    mission: TrainingStage | null;
    onComplete: (reaction: string) => void;
    isOpen: boolean;
}

const ISSUE_BY_TAG: Record<string, string> = {
    ignoring: "barking",
    treat_reward: "general",
    clicker: "general",
    kennel: "separation",
    toy: "general",
    touch: "general",
    sound_desensitization: "barking",
    nosework: "excitement",
    waiting: "excitement",
};

function mapIssue(step: TrainingStep): string {
    const tag = step.tags?.[0];
    if (!tag) return "general";
    return ISSUE_BY_TAG[tag] || "general";
}

function buildLocalCAlternative(step: TrainingStep): TrainingAlternative {
    return {
        id: "C",
        title: `${step.title} - C안`,
        description: "한 번에 길게 하지 말고 1~2분 단위로 나눠 성공 경험을 쌓은 뒤, 난도를 천천히 올려주세요.",
    };
}

function buildLocalBAlternative(step: TrainingStep): TrainingAlternative {
    return {
        id: "B",
        title: `${step.title} - B안`,
        description: "자극을 낮춘 환경에서 같은 동작을 더 짧게 반복하고, 성공 즉시 보상을 제공해 기준을 재설정해보세요.",
    };
}

export function useMissionAction({ curriculumId, dogId, mission, onComplete, isOpen }: UseMissionActionProps) {
    const { token } = useAuth();
    const updateStatus = useUpdateTrainingStatus(token);
    const fetchCAlternative = useFetchCAlternative(token);

    const [currentStep, setCurrentStep] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [swapping, setSwapping] = useState(false);
    const [showVault, setShowVault] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isLoadingCOption, setIsLoadingCOption] = useState(false);

    const [stepAlternativeQueue, setStepAlternativeQueue] = useState<Record<number, TrainingAlternative[]>>({});
    const [selectedAlternativeIndex, setSelectedAlternativeIndex] = useState<Record<number, number>>({});
    const [cOptionRequested, setCOptionRequested] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (isOpen && mission) {
            setIsCompleted(false);
            setCurrentStep(0);
            setSwapping(false);
            setShowVault(false);
            setIsLoadingCOption(false);

            const initialQueue: Record<number, TrainingAlternative[]> = {};
            const initialSelectedIndex: Record<number, number> = {};

            mission.steps.forEach((step) => {
                const queue =
                    step.alternatives && step.alternatives.length > 0
                        ? [step.alternatives[0]]
                        : [buildLocalBAlternative(step)];
                initialQueue[step.step_number] = queue;

                if (!step.activeAlternativeId) {
                    initialSelectedIndex[step.step_number] = -1;
                    return;
                }

                const index = queue.findIndex((alternative) => alternative.id === step.activeAlternativeId);
                initialSelectedIndex[step.step_number] = index >= 0 ? index : -1;
            });

            setStepAlternativeQueue(initialQueue);
            setSelectedAlternativeIndex(initialSelectedIndex);
            setCOptionRequested({});
        }
    }, [isOpen, mission?.id]);

    const getSelectedAlternative = (stepNumber: number): TrainingAlternative | null => {
        const queue = stepAlternativeQueue[stepNumber] || [];
        const selectedIndex = selectedAlternativeIndex[stepNumber] ?? -1;
        if (selectedIndex < 0 || selectedIndex >= queue.length) return null;
        return queue[selectedIndex];
    };

    const handleComplete = () => {
        setIsCompleted(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: [...CONFETTI_COLORS],
        });
    };

    const handleNext = () => {
        if (!mission) return;
        if (currentStep < mission.steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
            setShowVault(false);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
            setShowVault(false);
        }
    };

    const handleIneffective = async () => {
        if (!curriculumId || !mission) return;
        const step = mission.steps[currentStep];
        if (!step) return;

        const stepNumber = step.step_number;
        const queue = stepAlternativeQueue[stepNumber] || [];
        const index = selectedAlternativeIndex[stepNumber] ?? -1;

        if (index < 0) {
            if (queue.length === 0) return;
            setSwapping(true);
            setTimeout(() => {
                setSelectedAlternativeIndex((prev) => ({ ...prev, [stepNumber]: 0 }));
                setSwapping(false);
            }, 500);
            return;
        }

        if (index >= 1) {
            return;
        }

        if (queue[1]) {
            setSelectedAlternativeIndex((prev) => ({ ...prev, [stepNumber]: 1 }));
            return;
        }

        if (cOptionRequested[stepNumber]) {
            return;
        }

        setCOptionRequested((prev) => ({ ...prev, [stepNumber]: true }));
        setSwapping(true);
        setIsLoadingCOption(true);

        try {
            let cAlternative: TrainingAlternative;

            if (!dogId) {
                cAlternative = buildLocalCAlternative(step);
            } else {
                try {
                    cAlternative = await fetchCAlternative.mutateAsync({
                        dog_id: dogId,
                        issue: mapIssue(step),
                        window_days: 7,
                    });
                } catch {
                    cAlternative = buildLocalCAlternative(step);
                }
            }

            const normalizedC: TrainingAlternative = {
                id: "C",
                title: cAlternative.title || `${step.title} - C안`,
                description: cAlternative.description || buildLocalCAlternative(step).description,
            };

            setStepAlternativeQueue((prev) => {
                const currentQueue = prev[stepNumber] || [];
                const withoutC = currentQueue.filter((alternative) => alternative.id !== "C");
                return {
                    ...prev,
                    [stepNumber]: [...withoutC, normalizedC],
                };
            });

            setSelectedAlternativeIndex((prev) => ({ ...prev, [stepNumber]: 1 }));
        } finally {
            setSwapping(false);
            setIsLoadingCOption(false);
        }
    };

    const handleSkipStep = async () => {
        if (!curriculumId || !mission) return;
        const step = mission.steps[currentStep];
        if (!step) return;

        try {
            setIsPending(true);
            await updateStatus.mutateAsync({
                curriculum_id: curriculumId,
                stage_id: mission.id,
                step_number: step.step_number,
                status: "SKIPPED_INEFFECTIVE",
            });
            handleNext();
        } catch (err) {
            console.error("Failed to skip step:", err);
        } finally {
            setIsPending(false);
        }
    };

    const handleConfirmSwap = async () => {
        if (!curriculumId || !mission) return;
        const step = mission.steps[currentStep];
        if (!step) return;

        const selectedAlternative = getSelectedAlternative(step.step_number);
        if (!selectedAlternative) return;

        try {
            setIsPending(true);
            await updateStatus.mutateAsync({
                curriculum_id: curriculumId,
                stage_id: mission.id,
                step_number: step.step_number,
                status: "SKIPPED_INEFFECTIVE",
            });
            handleNext();
        } catch (err) {
            console.error("Failed to swap status:", err);
        } finally {
            setIsPending(false);
        }
    };

    const handleReaction = async (reaction: string) => {
        if (curriculumId && mission) {
            try {
                await Promise.all(
                    mission.steps.map((step) => {
                        const selectedIndex = selectedAlternativeIndex[step.step_number] ?? -1;
                        const hasAltSelection = selectedIndex >= 0;
                        if (hasAltSelection || step.activeAlternativeId) return Promise.resolve();

                        return updateStatus.mutateAsync({
                            curriculum_id: curriculumId,
                            stage_id: mission.id,
                            step_number: step.step_number,
                            status: "COMPLETED",
                        });
                    })
                );
            } catch (err) {
                console.error("Failed to mark steps as completed:", err);
            }
        }

        onComplete(reaction);
    };

    const cancelSwap = (stepNumber: number) => {
        setSelectedAlternativeIndex((prev) => ({
            ...prev,
            [stepNumber]: -1,
        }));
        setShowVault(false);
    };

    const canRequestAlternative = (stepNumber: number) => {
        const queue = stepAlternativeQueue[stepNumber] || [];
        const selectedIndex = selectedAlternativeIndex[stepNumber] ?? -1;

        if (selectedIndex < 0) {
            return queue.length > 0;
        }

        return selectedIndex === 0;
    };

    return {
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
        handleSkipStep,
        handleConfirmSwap,
        handleReaction,
        cancelSwap,
        getSelectedAlternative,
        canRequestAlternative,
    };
}
