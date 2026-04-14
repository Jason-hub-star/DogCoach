'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { MessageCircle, Download, Sparkles } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface ConversionCTAProps {
    isAuthenticated: boolean;
}

export function ConversionCTA({ isAuthenticated }: ConversionCTAProps) {
    const [loading, setLoading] = useState(false);

    // Hide CTA if user is already authenticated
    if (isAuthenticated) {
        return null;
    }

    const handleKakaoLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'kakao',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?returnTo=/dashboard`,
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with Kakao:', error);
            alert('카카오 로그인 중 오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.8 }}
            className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-white via-white/95 to-transparent z-50 flex flex-col items-center font-outfit"
        >
            <div className="w-full max-w-xl mx-auto space-y-4">
                {/* Visual Hint */}
                <div className="flex justify-center mb-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-lime/10 text-brand-lime rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-lime/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        Next Level Coaching
                    </div>
                </div>

                {/* Primary Button - Kakao Premium with onClick */}
                <button
                    onClick={handleKakaoLogin}
                    disabled={loading}
                    className="w-full bg-kakao-yellow hover:bg-kakao-yellow-hover active:scale-[0.98] text-kakao-brown font-black py-5 px-8 rounded-[1.5rem] shadow-2xl shadow-yellow-200/60 flex items-center justify-center gap-3 transition-all group overflow-hidden relative disabled:opacity-70"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-kakao-brown/30 border-t-kakao-brown rounded-full animate-spin relative z-10" />
                    ) : (
                        <>
                            <MessageCircle className="w-6 h-6 fill-kakao-brown relative z-10" />
                            <span className="text-md relative z-10">리포트 저장하고 매일 코칭받기</span>
                        </>
                    )}
                </button>

                <div className="text-center px-4">
                    <p className="text-[11px] text-gray-400 mb-4 font-medium leading-relaxed opacity-80 break-keep">
                        카카오로 1초 만에 시작하면, 내일부터 우리 아이가<br /> 직접 보내는 <strong>데일리 알림톡</strong>을 받을 수 있어요.
                    </p>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-center gap-2">
                        <button className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-widest bg-gray-50/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 hover:bg-gray-100 transition-all active:scale-95 shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                            <span>Install PWA</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
