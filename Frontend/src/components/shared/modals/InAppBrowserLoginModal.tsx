"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, X, AlertTriangle } from "lucide-react";

type Platform = "android" | "ios" | "other";

interface InAppBrowserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform;
  onOpenExternal: () => void;
  onCopyLink: () => Promise<boolean>;
}

export function InAppBrowserLoginModal({
  isOpen,
  onClose,
  platform,
  onOpenExternal,
  onCopyLink,
}: InAppBrowserLoginModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await onCopyLink();
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            In-App Browser
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-3 break-keep">
            카카오톡 인앱브라우저에서는 Google 로그인이 차단될 수 있어요
          </h2>

          <p className="text-sm text-gray-500 font-medium mb-8 break-keep">
            외부 브라우저에서 로그인하면 정상적으로 진행됩니다.
            {platform === "ios" && (
              <>
                <br />
                iPhone은 우측 상단 메뉴에서 &#39;Safari에서 열기&#39;를 선택해 주세요.
              </>
            )}
          </p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenExternal}
              className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl transition-all inline-flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>외부 브라우저</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-800 font-black py-4 rounded-2xl transition-all inline-flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? "복사됨" : "링크 복사"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
