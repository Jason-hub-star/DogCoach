"use client";

import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ValidationErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    errors: string[];
}

export function ValidationErrorModal({ isOpen, onClose, errors }: ValidationErrorModalProps) {
    if (!isOpen) return null;

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
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        필수 정보 누락
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-black text-slate-800 mb-3 break-keep">
                        필수 정보를 입력해주세요
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-gray-500 font-medium mb-6 break-keep">
                        아래 정보를 입력하셔야 설문을 제출할 수 있습니다.
                    </p>

                    {/* Error List */}
                    <div className="bg-red-50/50 rounded-2xl p-4 mb-8 text-left">
                        <ul className="space-y-2">
                            {errors.map((error, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span className="text-sm font-bold text-gray-700">{error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Close Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl transition-all"
                    >
                        확인
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
