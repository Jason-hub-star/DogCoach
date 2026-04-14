import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    type?: "success" | "error" | "info";
}

export const Toast = ({ message, isVisible, onClose, duration = 2000, type = "success" }: ToastProps) => {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
        if (isVisible) {
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible && !show) return null;

    const bgColors = {
        success: "bg-slate-800",
        error: "bg-red-500",
        info: "bg-blue-500"
    };

    const toast = (
        <div
            style={{ zIndex: 9999 }}
            className={cn(
                "fixed bottom-24 left-1/2 -translate-x-1/2",
                "flex items-center gap-3 px-6 py-3 rounded-full shadow-xl",
                bgColors[type],
                "transition-all duration-300 transform",
                show ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
            )}
        >
            <span className="text-xl">
                {type === "success" && "✅"}
                {type === "error" && "⚠️"}
                {type === "info" && "ℹ️"}
            </span>
            <span className="text-white font-medium text-sm whitespace-nowrap">
                {message}
            </span>
        </div>
    );

    if (typeof document === "undefined") return toast;
    return createPortal(toast, document.body);
};
