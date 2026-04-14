"use client";

import { motion } from "framer-motion";
import { DESIGN_COLORS } from "@/lib/theme/colors";

interface DebugLoginToggleProps {
    isLoggedIn: boolean;
    onToggle: () => void;
}

export function DebugLoginToggle({ isLoggedIn, onToggle }: DebugLoginToggleProps) {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <motion.button
            initial={{ opacity: 0.5 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="fixed top-4 left-4 z-50 px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg transition-colors flex items-center gap-2"
            style={{
                backgroundColor: isLoggedIn ? DESIGN_COLORS.success100 : DESIGN_COLORS.error100,
                color: isLoggedIn ? DESIGN_COLORS.success700 : DESIGN_COLORS.error800,
                borderColor: isLoggedIn ? DESIGN_COLORS.success300 : DESIGN_COLORS.error300,
            }}
        >
            <span>🚧 DEBUG: {isLoggedIn ? 'LOGGED IN (User)' : 'GUEST (Visitor)'}</span>
        </motion.button>
    );
}
