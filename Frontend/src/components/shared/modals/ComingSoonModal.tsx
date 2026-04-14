"use client";

import { motion } from "framer-motion";
import { Construction, X } from "lucide-react";

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export function ComingSoonModal({ isOpen, onClose, featureName }: ComingSoonModalProps) {
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
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-lime/10 mb-6">
                        <Construction className="w-10 h-10 text-brand-lime" />
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        Coming Soon
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-black text-slate-800 mb-3 break-keep">
                        준비중입니다
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-gray-500 font-medium mb-8 break-keep">
                        {featureName ? (
                            <>{featureName}는 곧 만나보실 수 있습니다.</>
                        ) : (
                            <>이 기능은 곧 만나보실 수 있습니다.</>
                        )}
                    </p>

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
