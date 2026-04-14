import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScaleButton } from "@/components/ui/animations/ScaleButton";

interface MissionSuccessViewProps {
    onReaction: (reaction: string) => void;
}

export function MissionSuccessView({ onReaction }: MissionSuccessViewProps) {
    const reactions = [
        { id: "comfortable", emoji: "🙂", label: "편안해해요", sub: "긍정적인 변화", color: "text-brand-lime" },
        { id: "neutral", emoji: "😐", label: "평소와 같아요", sub: "지속적인 관찰 필요", color: "text-amber-500" },
        { id: "barking", emoji: "😠", label: "여전히 예민해요", sub: "도움이 필요해요", color: "text-red-500" }
    ];

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 space-y-8"
        >
            <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">훌륭합니다!</h3>
                <p className="text-gray-500 font-medium break-keep leading-relaxed">
                    오늘의 훈련을 성공적으로 마쳤어요.<br />
                    훈련 중 강아지의 반응은 어땠나요?
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {reactions.map((reaction) => (
                    <ScaleButton key={reaction.id} onClick={() => onReaction(reaction.id)}>
                        <div className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-lime hover:bg-brand-lime/5 transition-all text-left group shadow-sm">
                            <span className="text-3xl group-hover:scale-110 transition-transform">{reaction.emoji}</span>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{reaction.label}</p>
                                <p className={`text-[10px] font-black uppercase ${reaction.color}`}>{reaction.sub}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-lime group-hover:translate-x-1 transition-all" />
                        </div>
                    </ScaleButton>
                ))}
            </div>
        </motion.div>
    );
}
