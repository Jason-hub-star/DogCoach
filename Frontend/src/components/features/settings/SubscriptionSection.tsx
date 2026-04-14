'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Subscription } from '@/lib/types';
import { ComingSoonModal } from '@/components/shared/modals/ComingSoonModal';

interface Props {
    subscription?: Subscription;
    onUpgrade: () => void;
    onManageSubscription: () => void;
}

import { motion } from 'framer-motion';
import { Star, CheckCircle2, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SubscriptionSection({ subscription, onUpgrade, onManageSubscription }: Props) {
    const [comingSoonModal, setComingSoonModal] = useState({ isOpen: false, featureName: '' });

    const handleComingSoon = (featureName: string) => {
        setComingSoonModal({ isOpen: true, featureName });
    };
    const isPro = subscription?.plan_type === 'PRO_MONTHLY' || subscription?.plan_type === 'PRO_YEARLY';
    const contestMode = process.env.NEXT_PUBLIC_ENABLE_PRO_FEATURES === 'true';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <Star className="w-5 h-5 text-brand-lime" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight">멤버십 및 구독</h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-[3rem] shadow-elev-lg border border-white/60 relative overflow-hidden group ring-1 ring-black/5"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-lime/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Plan</span>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {isPro ? 'Pro Member' : 'Standard'}
                                </h3>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    isPro
                                        ? "bg-brand-lime/10 text-brand-lime border-brand-lime/20 shadow-sm"
                                        : "bg-gray-100/50 text-gray-400 border-gray-200/50"
                                )}>
                                    {isPro ? 'Premium' : 'Free'}
                                </div>
                            </div>
                        </div>
                        {isPro && <Crown className="w-8 h-8 text-brand-lime animate-pulse" />}
                    </div>

                    <div className="space-y-6">
                        {isPro ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-inner">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Next Billing Date</p>
                                    <p className="text-sm font-black text-slate-800">
                                        {subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'Active'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleComingSoon('구독 관리')}
                                    className="w-full bg-white/60 border border-white/80 py-4 rounded-2xl text-sm font-black text-gray-700 hover:bg-white transition-all shadow-sm"
                                >
                                    결제 수단 및 구독 관리
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm font-bold text-gray-500 leading-relaxed mb-4">
                                    Pro 멤버십으로 업그레이드하고 <br />
                                    <span className="text-slate-800">AI 심층 행동 분석</span>과 무제한 솔루션을 경험하세요.
                                </p>

                                <div className="space-y-3 bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-inner">
                                    {[
                                        "실시간 AI 정밀 행동 분석 레이더",
                                        "맞춤형 주간 훈련 리포트 발급"
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-black text-gray-700">
                                            <CheckCircle2 className="w-5 h-5 text-brand-lime shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

{contestMode ? (
                                    <div className="p-6 bg-brand-lime/10 border-2 border-brand-lime/30 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="px-2 py-1 bg-brand-lime text-slate-800 rounded text-[9px] font-black uppercase">
                                                공모전 시연 모드
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                            심사용 데모 환경입니다. 실제 구독 기능은 사업자 등록 및 결제 모듈 연동 후 활성화됩니다.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleComingSoon('Pro 구독')}
                                            className="w-full bg-slate-800 text-white p-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-slate-900 hover:shadow-xl hover:shadow-slate-900/20 group/btn"
                                        >
                                            지금 Pro 시작하기 (7일 무료)
                                            <div className="w-8 h-8 bg-brand-lime rounded-full flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                                <Crown className="w-4 h-4 text-slate-800 fill-current" />
                                            </div>
                                        </button>

                                        <div className="flex gap-2 p-2 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/60 focus-within:ring-2 focus-within:ring-brand-lime/30 transition-all">
                                            <input
                                                type="text"
                                                placeholder="초대/프로모션 코드"
                                                className="flex-1 px-4 bg-transparent text-xs font-bold focus:outline-none placeholder:text-gray-400"
                                            />
                                            <button onClick={() => handleComingSoon('프로모션 코드')} className="px-4 py-2 bg-white/50 text-gray-500 rounded-xl text-xs font-black hover:bg-white hover:text-slate-800 transition-all">
                                                적용
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <ComingSoonModal
                isOpen={comingSoonModal.isOpen}
                onClose={() => setComingSoonModal({ isOpen: false, featureName: '' })}
                featureName={comingSoonModal.featureName}
            />
        </div>
    );
}
