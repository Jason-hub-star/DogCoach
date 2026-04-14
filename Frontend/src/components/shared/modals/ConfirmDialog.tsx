"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "확인",
    cancelText = "취소",
    isDangerous = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                >
                    <X className="w-4 h-4 text-gray-600" />
                </button>

                {/* Content */}
                <div className="p-10 text-center">
                    {/* Icon */}
                    <div
                        className={cn(
                            "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6",
                            isDangerous ? "bg-red-50" : "bg-blue-50"
                        )}
                    >
                        <AlertTriangle
                            className={cn(
                                "w-10 h-10",
                                isDangerous ? "text-red-500" : "text-blue-500"
                            )}
                        />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-black text-slate-800 mb-3 break-keep">
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="text-sm text-gray-500 font-medium mb-8 break-keep">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {/* Cancel Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-800 font-black py-4 rounded-2xl transition-all"
                        >
                            {cancelText}
                        </motion.button>

                        {/* Confirm Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirm}
                            className={cn(
                                "flex-1 font-black py-4 rounded-2xl shadow-xl transition-all",
                                isDangerous
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-slate-800 hover:bg-slate-900 text-white"
                            )}
                        >
                            {confirmText}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
