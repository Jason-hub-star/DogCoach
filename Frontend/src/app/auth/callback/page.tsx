'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api';

type CallbackState = 'processing' | 'error' | 'success-routing';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [state, setState] = useState<CallbackState>('processing');
    const [errorMessage, setErrorMessage] = useState('');

    const handleAuthCallback = async () => {
        setState('processing');
        setErrorMessage('');

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            console.error('Auth callback error or no session:', error);
            setState('error');
            setErrorMessage(error?.message || '로그인 세션을 확인할 수 없습니다.');
            return;
        }

        try {
            await apiClient.post('/auth/migrate-guest', {}, {
                token: session.access_token,
                credentials: 'include',
            });
        } catch (migrationError) {
            // Keep callback flow non-blocking even if migration fails.
            console.warn('Guest migration failed during callback:', migrationError);
        }

        setState('success-routing');

        // Check for returnTo parameter (survey flow)
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('returnTo');
        const link = params.get('link'); // google | kakao (optional)

        const allowedReturnTo =
            returnTo === '/survey' ||
            returnTo === '/result' ||
            returnTo === '/settings' ||
            returnTo === '/dashboard';

        if (allowedReturnTo && returnTo === '/survey') {
            // User came from mid-survey - return to survey
            router.push('/survey');
            return;
        }

        if (allowedReturnTo && returnTo === '/result') {
            // User came from result page - return to result
            router.push('/result');
            return;
        }

        if (allowedReturnTo && returnTo === '/settings') {
            // User came from settings for account linking
            if (link === 'google' || link === 'kakao') {
                router.push(`/settings?linked=${encodeURIComponent(link)}`);
            } else {
                router.push('/settings');
            }
            return;
        }

        if (allowedReturnTo && returnTo === '/dashboard') {
            router.push('/dashboard');
            return;
        }

        // Original logic for normal login flow
        try {
            const profile = await apiClient.get<any>("/auth/me", { token: session.access_token });

            if (profile?.latest_dog_id) {
                router.push('/dashboard');
            } else {
                router.push('/survey');
            }
        } catch (err) {
            console.error('API Profile fetch error:', err);
            router.push('/survey');
        }
    };

    useEffect(() => {
        handleAuthCallback();
    }, []);

    if (state === 'error') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 text-center p-8">
                <div className="space-y-6 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800">로그인에 실패했습니다</h2>
                        <p className="text-gray-500">{errorMessage}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAuthCallback}
                            className="px-6 py-3 bg-brand-lime text-white font-bold rounded-xl hover:bg-brand-lime/90 transition-colors"
                        >
                            다시 시도하기
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            로그인 페이지로 이동
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-center p-8">
            <div className="space-y-6">
                <div className="w-16 h-16 border-4 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {state === 'processing' ? '로그인 중입니다' : '페이지 이동 중입니다'}
                    </h2>
                    <p className="text-gray-500">정보를 불러오고 있으니 잠시만 기다려주세요.</p>
                </div>
            </div>
        </div>
    );
}
