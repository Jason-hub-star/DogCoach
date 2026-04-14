"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SmoothToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    className?: string;
}

export function SmoothToggle({ checked, onCheckedChange, label, description, className }: SmoothToggleProps) {
    return (
        <div className={cn("flex items-center justify-between py-4 border-b last:border-0 border-gray-100", className)}>
            <div className="flex-1 pr-4">
                {label && <div className="font-medium text-slate-800">{label}</div>}
                {description && <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{description}</div>}
            </div>
            <button
                type="button"
                onClick={() => onCheckedChange(!checked)}
                className={cn(
                    "w-11 h-6 rounded-full relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-lime transition-colors",
                    checked ? "bg-brand-lime" : "bg-gray-200"
                )}
            >
                <motion.span
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    }}
                    className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm"
                    animate={{ x: checked ? 20 : 0 }}
                />
            </button>
        </div>
    );
}
