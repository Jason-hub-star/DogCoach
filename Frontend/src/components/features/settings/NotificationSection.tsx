'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserSettings } from '@/lib/types';
import { SmoothToggle } from '@/components/ui/animations/SmoothToggle';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    settings: UserSettings['notification_pref'];
    onUpdate: (newPref: UserSettings['notification_pref']) => void;
}

import { cn } from '@/lib/utils';
import { Bell, Info } from 'lucide-react';

export function NotificationSection({ settings, onUpdate }: Props) {
    const handleChannelChange = (channel: keyof typeof settings.channels, value: boolean) => {
        onUpdate({
            ...settings,
            channels: { ...settings.channels, [channel]: value },
        });
    };

    const handleTypeChange = (type: keyof typeof settings.types, value: boolean) => {
        onUpdate({
            ...settings,
            types: { ...settings.types, [type]: value },
        });
    };

    const handleQuietHoursChange = (key: keyof typeof settings.quiet_hours, value: any) => {
        onUpdate({
            ...settings,
            quiet_hours: { ...settings.quiet_hours, [key]: value },
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2 px-1">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-brand-lime" />
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">알림 설정</h2>
                </div>
                {(!settings.channels.alimtalk && !settings.channels.push) && (
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest animate-pulse">
                        Notifications help build better habits Faster
                    </span>
                )}
            </div>

            <div className="grid gap-10">
                {/* 1. Channels */}
                <div className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-sm transition-all hover:shadow-md ring-1 ring-black/5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Delivery Channels</h3>
                    <div className="space-y-4">
                        <div className="opacity-50 pointer-events-none">
                            <div className="flex items-center justify-between p-6 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-800">카카오 알림톡</span>
                                        <div className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px] font-black uppercase">
                                            준비중
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500">
                                        카카오 연동 준비 중입니다.
                                    </span>
                                </div>
                                <div className="w-12 h-6 bg-gray-100 border border-gray-200 rounded-full relative">
                                    <div className="absolute top-[4px] left-[4px] bg-white rounded-full h-4 w-4 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                        <SmoothToggle
                            label="앱 푸시"
                            description="데일리 기록 리마인더 및 응원"
                            checked={settings.channels.push}
                            onCheckedChange={(v) => handleChannelChange('push', v)}
                        />
                    </div>
                </div>

                {/* 2. Notification Types */}
                <div className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-sm ring-1 ring-black/5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Notification Content</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <SmoothToggle
                                label="기록 리마인더"
                                description={`매일 ${settings.remind_time}에 기록 제안`}
                                checked={settings.types.reminder}
                                onCheckedChange={(v) => handleTypeChange('reminder', v)}
                            />
                            <AnimatePresence>
                                {settings.types.reminder && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between p-5 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/60 shadow-inner mt-2">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Remind Time</span>
                                            <input
                                                type="time"
                                                value={settings.remind_time}
                                                onChange={(e) => onUpdate({ ...settings, remind_time: e.target.value })}
                                                className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-lime/30 shadow-sm"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <SmoothToggle
                            label="심층 분석 리포트"
                            description="정밀 AI 행동 패턴 보고서"
                            checked={settings.types.weekly_report}
                            onCheckedChange={(v) => handleTypeChange('weekly_report', v)}
                        />
                        <SmoothToggle
                            label="혜택 및 이벤트"
                            description="멤버십 사은 프로모션 및 소식"
                            checked={settings.types.marketing}
                            onCheckedChange={(v) => handleTypeChange('marketing', v)}
                        />
                    </div>
                </div>

                {/* 3. Quiet Hours */}
                <div className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Silent Hours</h3>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input type="checkbox" className="sr-only peer" checked={settings.quiet_hours.enabled} onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)} />
                            <div className="w-12 h-6 bg-gray-100/50 border border-gray-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-lime shadow-inner group-hover:scale-110 duration-200"></div>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {settings.quiet_hours.enabled && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-inner mb-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start</label>
                                            <input
                                                type="time"
                                                value={settings.quiet_hours.start}
                                                onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-slate-800 focus:outline-none shadow-sm"
                                            />
                                        </div>
                                        <div className="pt-6 font-black text-gray-300">→</div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End</label>
                                            <input
                                                type="time"
                                                value={settings.quiet_hours.end}
                                                onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-slate-800 focus:outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex items-start gap-2 text-xs font-bold text-gray-400 leading-relaxed px-1">
                            <Info className="w-4 h-4 shrink-0 text-brand-lime mt-0.5" />
                            <p>방해 금지 시간대에는 긴급 분석 요청을 제외한 일반 리마인더 발송이 제한됩니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
