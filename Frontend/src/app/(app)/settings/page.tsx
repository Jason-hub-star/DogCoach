'use client';

import { SubscriptionSection } from '@/components/features/settings/SubscriptionSection';
import { NotificationSection } from '@/components/features/settings/NotificationSection';
import { AccountSection } from '@/components/features/settings/AccountSection';
import { AiPreferenceSettings } from '@/components/features/settings/AiPreferenceSettings';
import { DataSection } from '@/components/features/settings/DataSection';
import { AppInfoSection } from '@/components/features/settings/AppInfoSection';
import { PremiumBackground } from '@/components/shared/ui/PremiumBackground';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, useUserSettings, useUpdateUserSettings } from '@/hooks/useQueries';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Default settings structure for when backend is ready
const DEFAULT_NOTIFICATION_PREF = {
    channels: { alimtalk: true, push: true, email: false },
    types: { reminder: true, weekly_report: true, marketing: false },
    quiet_hours: { enabled: false, start: '22:00', end: '07:00' },
    remind_time: '20:00'
};

const DEFAULT_AI_PERSONA = {
    tone: 'EMPATHETIC' as const,
    perspective: 'COACH' as const
};

const DEFAULT_SUBSCRIPTION = {
    id: '',
    user_id: '',
    plan_type: 'FREE' as const,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

export default function SettingsPage() {
    const router = useRouter();
    const { token } = useAuth();
    const { data: userProfile } = useUserProfile(token);

    const [linkedProvider, setLinkedProvider] = useState<'google' | 'kakao' | null>(null);

    const [showLinkedBanner, setShowLinkedBanner] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const p = params.get('linked');
        if (p === 'google' || p === 'kakao') setLinkedProvider(p);
    }, []);

    useEffect(() => {
        if (!linkedProvider) return;
        setShowLinkedBanner(true);

        const t1 = window.setTimeout(() => setShowLinkedBanner(false), 3000);
        const t2 = window.setTimeout(() => router.replace('/settings'), 3200);
        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [linkedProvider, router]);

    // User Settings API Integration
    const { data: userSettings, isLoading } = useUserSettings(token);
    const updateSettings = useUpdateUserSettings(token);

    const handleSettingsUpdate = (key: string, value: any) => {
        updateSettings.mutate({ [key]: value });
    };

    const handleTimezoneUpdate = async (tz: string) => {
        // TODO: Implement when /auth/me PATCH is ready
        console.log('Timezone will be updated via API:', tz);
    };

    // Use real data with fallback to defaults
    const notificationPref = userSettings?.notification_pref ?? DEFAULT_NOTIFICATION_PREF;
    const aiPersona = userSettings?.ai_persona ?? DEFAULT_AI_PERSONA;

    return (
        <div className="min-h-screen pb-32 relative">
            <PremiumBackground />

            {/* 1. Glass Header */}
            <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-md border-b border-white/60 ring-1 ring-black/5 px-6 py-5">
                <div className="container mx-auto max-w-2xl flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em] mb-0.5">Configuration</span>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">환경 설정</h1>
                    </div>
                </div>
            </header>

            <main className="px-6 py-10 container mx-auto max-w-2xl space-y-10 relative z-10">
                {showLinkedBanner && linkedProvider && (
                    <div className="glass p-5 rounded-[2rem] border border-white/60 shadow-sm ring-1 ring-black/5">
                        <div className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em] mb-1">
                            Account Linked
                        </div>
                        <div className="text-sm font-black text-slate-800 break-keep">
                            {linkedProvider === 'google' ? 'Google' : 'Kakao'} 연결이 완료되었습니다.
                        </div>
                    </div>
                )}

                {/* 1. 멤버십 (Bento Card) */}
                <section id="subscription" className="transition-all hover:translate-y-[-2px] duration-500">
                    <SubscriptionSection
                        subscription={DEFAULT_SUBSCRIPTION}
                        onUpgrade={() => console.log('구독 준비 중')}
                        onManageSubscription={() => console.log('구독 관리 준비 중')}
                    />
                </section>

                {/* Grid for settings sections */}
                <div className="grid grid-cols-1 gap-10">
                    {/* 2. 알림 */}
                    <section id="notifications">
                        <NotificationSection
                            settings={notificationPref}
                            onUpdate={(newPref) => handleSettingsUpdate('notification_pref', newPref)}
                        />
                    </section>

                    {/* 3. 계정 */}
                    <section id="account">
                        <AccountSection
                            timezone={userProfile?.timezone || 'Asia/Seoul'}
                            onUpdateTimezone={handleTimezoneUpdate}
                        />
                    </section>

                    {/* 4. AI 설정 */}
                    <section id="ai-preference">
                        <AiPreferenceSettings
                            preference={aiPersona}
                            onUpdate={(newPersona) => handleSettingsUpdate('ai_persona', newPersona)}
                        />
                    </section>

                    {/* 5. 데이터 */}
                    <section id="data">
                        <DataSection isPro={false} />
                    </section>

                    {/* 6. 앱 정보 */}
                    <section id="app-info">
                        <AppInfoSection />
                    </section>
                </div>
            </main>
        </div>
    );
}
