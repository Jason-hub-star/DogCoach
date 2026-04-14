'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Link2, Unlink, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '@/components/shared/modals/ConfirmDialog';
import { getUserAgent, isKakaoTalkInAppBrowser } from '@/lib/inAppBrowser';

interface Props {
    timezone: string;
    onUpdateTimezone: (tz: string) => Promise<void>;
}

export function AccountSection({ timezone, onUpdateTimezone }: Props) {
    const { token, user } = useAuth();
    const isLoggedIn = !!user && !user.is_anonymous && !!token;

    const isKakaoInApp = useMemo(() => isKakaoTalkInAppBrowser(getUserAgent()), []);

    type Provider = 'google' | 'kakao';

    const [identities, setIdentities] = useState<any[]>([]);
    const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
    const [confirmUnlink, setConfirmUnlink] = useState<Provider | null>(null);

    const refreshIdentities = async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            setIdentities((data as any)?.user?.identities ?? []);
        } catch (e) {
            console.warn('Failed to load identities:', e);
            setIdentities([]);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) {
            setIdentities([]);
            return;
        }
        refreshIdentities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    const identityByProvider = useMemo(() => {
        const map: Record<Provider, any | null> = { google: null, kakao: null };
        for (const id of identities || []) {
            const p = (id as any)?.provider as string | undefined;
            if (p === 'google') map.google = id;
            if (p === 'kakao') map.kakao = id;
        }
        return map;
    }, [identities]);

    const linked = useMemo(() => {
        return {
            google: !!identityByProvider.google,
            kakao: !!identityByProvider.kakao,
        };
    }, [identityByProvider]);

    const buildLinkRedirectTo = (provider: Provider) => {
        return `${window.location.origin}/auth/callback?returnTo=/settings&link=${encodeURIComponent(provider)}`;
    };

    const handleLink = async (provider: Provider) => {
        if (!isLoggedIn) return;
        if (isKakaoInApp) {
            alert('계정 연결은 외부 브라우저에서만 지원됩니다. 우측 상단 메뉴에서 Safari/Chrome으로 열기 후 진행해주세요.');
            return;
        }

        setLoadingProvider(provider);
        try {
            const { error } = await supabase.auth.linkIdentity({
                provider,
                options: { redirectTo: buildLinkRedirectTo(provider) },
            });
            if (error) throw error;
            // Usually redirects; if not, refresh state.
            await refreshIdentities();
        } catch (e: any) {
            console.error('Link identity error:', e);
            const code = e?.code || e?.error?.code;
            if (code === 'identity_already_exists') {
                alert('이 로그인 수단은 이미 다른 계정에 연결되어 있습니다.');
            } else {
                alert('계정 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setLoadingProvider(null);
        }
    };

    const handleUnlink = async (provider: Provider) => {
        if (!isLoggedIn) return;
        if (isKakaoInApp) {
            alert('계정 연결 해제는 외부 브라우저에서만 지원됩니다. 우측 상단 메뉴에서 Safari/Chrome으로 열기 후 진행해주세요.');
            return;
        }

        const identity = identityByProvider[provider];
        if (!identity) return;

        setLoadingProvider(provider);
        try {
            const { error } = await supabase.auth.unlinkIdentity(identity);
            if (error) throw error;
            await refreshIdentities();
        } catch (e: any) {
            console.error('Unlink identity error:', e);
            const code = e?.code || e?.error?.code;
            if (code === 'single_identity_not_deletable') {
                alert('최소 1개의 로그인 수단은 유지되어야 합니다.');
            } else {
                alert('계정 연결 해제에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <ShieldCheck className="w-5 h-5 text-brand-lime" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight">계정 및 보안</h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-sm ring-1 ring-black/5"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">지역 설정</h3>
                    </div>
                    <div className="p-6 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">표시 시간대</span>
                            <select
                                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-lime/30 shadow-sm appearance-none cursor-pointer"
                                value={timezone}
                                onChange={(e) => onUpdateTimezone(e.target.value)}
                            >
                                <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                                <option value="America/New_York">America/New_York (EST)</option>
                                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                            </select>
                            <div className="text-[10px] font-bold text-gray-400 leading-relaxed flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-brand-lime" />
                                기록 시간과 알림 시간대를 설정합니다.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/60">
                    <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">濡쒓렇??연결</h3>
                    </div>

                    <div className="p-6 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner space-y-3">
                        {!isLoggedIn && (
                            <div className="flex items-start gap-2 text-[10px] font-bold text-gray-400 leading-relaxed">
                                <div className="mt-1 w-1 h-1 rounded-full bg-brand-lime" />
                                연결은 로그인 후 가능합니다.
                            </div>
                        )}

                        {isKakaoInApp && (
                            <div className="flex items-start gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4">
                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                                <div className="text-[10px] font-bold text-amber-800 leading-relaxed break-keep">
                                    카카오톡 인앱브라우저에서는 계정 연결이 불안정할 수 있어요.
                                    <br />
                                    우측 상단 메뉴에서 Safari/Chrome으로 열기 후 진행해주세요.
                                </div>
                            </div>
                        )}

                        {/* Google */}
                        <div className="flex items-center justify-between gap-3 p-4 bg-white/60 rounded-2xl border border-white/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-sm">
                                    G
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-sm font-black text-slate-800">Google</div>
                                    <div className="text-[10px] font-bold text-gray-400">{linked.google ? '연결됨' : '미연결'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className={linked.google
                                        ? "px-3 py-1 rounded-full text-[10px] font-black bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
                                        : "px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 border border-gray-200"}
                                >
                                    {linked.google ? '연결됨' : '미연결'}
                                </span>

                                {linked.google ? (
                                    <button
                                        type="button"
                                        disabled={!isLoggedIn || !!loadingProvider}
                                        onClick={() => setConfirmUnlink('google')}
                                        className="h-10 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-slate-800 font-black text-xs transition-all disabled:opacity-60 inline-flex items-center gap-2"
                                    >
                                        <Unlink className="w-4 h-4" />
                                        해제
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={!isLoggedIn || !!loadingProvider}
                                        onClick={() => handleLink('google')}
                                        className="h-10 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs shadow-sm transition-all disabled:opacity-60"
                                    >
                                        {loadingProvider === 'google' ? '연결 중' : '연결'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Kakao */}
                        <div className="flex items-center justify-between gap-3 p-4 bg-white/60 rounded-2xl border border-white/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-kakao-yellow text-kakao-brown flex items-center justify-center font-black text-sm">
                                    K
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-sm font-black text-slate-800">Kakao</div>
                                    <div className="text-[10px] font-bold text-gray-400">{linked.kakao ? '연결됨' : '미연결'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className={linked.kakao
                                        ? "px-3 py-1 rounded-full text-[10px] font-black bg-brand-lime/10 text-brand-lime border border-brand-lime/20"
                                        : "px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 border border-gray-200"}
                                >
                                    {linked.kakao ? '연결됨' : '미연결'}
                                </span>

                                {linked.kakao ? (
                                    <button
                                        type="button"
                                        disabled={!isLoggedIn || !!loadingProvider}
                                        onClick={() => setConfirmUnlink('kakao')}
                                        className="h-10 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-slate-800 font-black text-xs transition-all disabled:opacity-60 inline-flex items-center gap-2"
                                    >
                                        <Unlink className="w-4 h-4" />
                                        해제
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={!isLoggedIn || !!loadingProvider}
                                        onClick={() => handleLink('kakao')}
                                        className="h-10 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs shadow-sm transition-all disabled:opacity-60"
                                    >
                                        {loadingProvider === 'kakao' ? '연결 중' : '연결'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <ConfirmDialog
                isOpen={confirmUnlink !== null}
                onClose={() => setConfirmUnlink(null)}
                onConfirm={() => {
                    if (!confirmUnlink) return;
                    handleUnlink(confirmUnlink);
                }}
                title="연결 해제"
                message="정말로 이 로그인 수단의 연결을 해제할까요?"
                confirmText="해제"
                cancelText="취소"
                isDangerous
            />
        </div>
    );
}
