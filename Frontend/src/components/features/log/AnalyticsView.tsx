"use client";

import { useMemo, useState } from "react";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Sparkles, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DESIGN_COLORS, EFFECT_COLORS } from "@/lib/theme/colors";

interface AnalyticsViewProps {
    logs: any[]; // Replace with implicit Log type
    id?: string; // Optional ID for capturing
}

export function AnalyticsView({ logs, id }: AnalyticsViewProps) {
    const [patternTab, setPatternTab] = useState<"hourly" | "daily">("hourly");
    const logCount = logs?.length ?? 0;
    // Always show real data (mock preview disabled)
    const showMockPreview = false;

    const mockRadarData = useMemo(
        () => [
            { subject: "외부 소리", A: 6, fullMark: 10 },
            { subject: "현관 움직임", A: 5, fullMark: 10 },
            { subject: "혼자 있는 시간", A: 7, fullMark: 10 },
            { subject: "산책 전 흥분", A: 4, fullMark: 10 },
            { subject: "낯선 사람", A: 3, fullMark: 10 },
        ],
        []
    );

    const mockHourlyData = useMemo(
        () =>
            new Array(24).fill(0).map((_, hour) => {
                const morning = hour >= 7 && hour <= 9 ? 3 : 0;
                const evening = hour >= 18 && hour <= 22 ? 4 : 0;
                const baseline = hour % 6 === 0 ? 1 : 0;
                return {
                    hour,
                    count: morning + evening + baseline,
                    label: `${hour}시`,
                };
            }),
        []
    );

    const mockDayData = useMemo(
        () => [
            { day: "일", count: 3 },
            { day: "월", count: 4 },
            { day: "화", count: 2 },
            { day: "수", count: 5 },
            { day: "목", count: 4 },
            { day: "금", count: 6 },
            { day: "토", count: 5 },
        ],
        []
    );

    // 1. Radar Chart Data: Top 5 Triggers
    const realRadarData = useMemo(() => {
        if (!logs || logs.length === 0) return [];

        const counts: Record<string, number> = {};
        logs.forEach(log => {
            const key = log.antecedent || "알 수 없음";
            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([subject, A]) => ({ subject, A, fullMark: 10 }))
            .sort((a, b) => b.A - a.A)
            .slice(0, 5);
    }, [logs]);

    // 2. Heatmap Data: Frequency by Hour (0-23)
    const realHourlyData = useMemo(() => {
        const hours = new Array(24).fill(0);
        logs?.forEach(log => {
            const date = new Date(log.occurred_at);
            const h = date.getHours();
            hours[h]++;
        });
        return hours.map((count, hour) => ({
            hour,
            count,
            label: `${hour}시`
        }));
    }, [logs]);

    // 3. Weekly Heatmap Grid (7 days)
    const realDayData = useMemo(() => {
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const counts = new Array(7).fill(0);
        logs?.forEach(log => {
            const d = new Date(log.occurred_at).getDay();
            counts[d]++;
        });
        return days.map((day, idx) => ({ day, count: counts[idx] }));
    }, [logs]);

    if (!logs || logs.length === 0) {
        return (
            <div className="glass p-8 rounded-[2.5rem] border border-white/60 ring-1 ring-black/5 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-brand-lime" />
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-2">분석 준비 중이에요</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed break-keep">
                    아직 기록이 없어 차트를 그릴 수 없어요.<br />
                    첫 기록 1개만 추가해도 기본 패턴을 바로 보여드려요.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-lime/10 border border-brand-lime/20">
                    <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
                    <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">데이터 수집 대기 중</span>
                </div>
            </div>
        );
    }

    return (
        <div id={id} className="space-y-8">
            {/* 1. Radar Chart: Major Causes */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-7 rounded-[2.5rem] shadow-elev-base border border-white/60 relative overflow-hidden ring-1 ring-black/5"
            >
                <div className="flex flex-col mb-6">
                    <span className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em] mb-1">원인 분석</span>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">
                        주요 원인 분석
                    </h4>
                </div>

                <div className="h-72 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={showMockPreview ? mockRadarData : realRadarData}>
                            <PolarGrid stroke={DESIGN_COLORS.gray200} strokeDasharray="3 3" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: DESIGN_COLORS.gray400, fontSize: 10, fontWeight: 700 }} />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 'auto']}
                                tick={false}
                                axisLine={false}
                            />
                            <Radar
                                name="빈도"
                                dataKey="A"
                                stroke={DESIGN_COLORS.brandLime}
                                strokeWidth={3}
                                fill="url(#radarGradient)"
                                fillOpacity={0.6}
                            />
                            <defs>
                                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={DESIGN_COLORS.brandLime} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={DESIGN_COLORS.brandEmerald} stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                        </RadarChart>
                    </ResponsiveContainer>
                    {!showMockPreview && realRadarData.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-300 uppercase tracking-widest">
                            데이터 없음
                        </div>
                    )}
                </div>
            </motion.div>

            {/* 2. Unified Activity Card (Hourly + Daily Tabs) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-7 rounded-[2.5rem] shadow-elev-base border border-white/60 relative overflow-hidden ring-1 ring-black/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] mb-1">패턴 인사이트</span>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">
                            행동 패턴 분석
                        </h4>
                    </div>

                    <div className="flex bg-gray-100/50 p-1.5 rounded-2xl ring-1 ring-black/5">
                        <button
                            onClick={() => setPatternTab("hourly")}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                patternTab === "hourly" ? "bg-white text-slate-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            시간별
                        </button>
                        <button
                            onClick={() => setPatternTab("daily")}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                patternTab === "daily" ? "bg-white text-slate-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            요일별
                        </button>
                    </div>
                </div>

                <div className="h-64 sm:h-72 w-full">
                    <AnimatePresence mode="wait">
                        {patternTab === "hourly" ? (
                            <motion.div
                                key="hourly"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full w-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={showMockPreview ? mockHourlyData : realHourlyData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                        <XAxis
                                            dataKey="hour"
                                            tick={{ fontSize: 10, fill: DESIGN_COLORS.gray400, fontWeight: 700 }}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={3}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: DESIGN_COLORS.gray400, fontWeight: 700 }}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: EFFECT_COLORS.black02, radius: 8 }}
                                            contentStyle={{
                                                backgroundColor: EFFECT_COLORS.white80,
                                                backdropFilter: "blur(10px)",
                                                borderRadius: "16px",
                                                border: `1px solid ${EFFECT_COLORS.black05}`,
                                                boxShadow: `0 10px 25px -5px ${EFFECT_COLORS.black05}`
                                            }}
                                            labelStyle={{ color: DESIGN_COLORS.zinc900, fontWeight: 900, marginBottom: "4px" }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill={DESIGN_COLORS.zinc900}
                                            radius={[6, 6, 2, 2]}
                                            activeBar={{ fill: DESIGN_COLORS.brandLime }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="daily"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full w-full pt-4"
                            >
                                <div className="grid grid-cols-7 gap-3 sm:gap-4 h-full">
                                    {(showMockPreview ? mockDayData : realDayData).map((d, i) => (
                                        <div key={i} className="flex flex-col items-center gap-4">
                                            <div className="relative w-full flex-1 bg-gray-50/50 rounded-full overflow-hidden border border-gray-100/50 shadow-inner">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.min((d.count / (Math.max(...(showMockPreview ? mockDayData : realDayData).map(x => x.count)) || 1)) * 100, 100)}%` }}
                                                    transition={{ duration: 1, delay: 0.1 + (i * 0.05), type: "spring", damping: 15 }}
                                                    className="absolute bottom-0 w-full bg-gradient-to-t from-brand-orange to-orange-400 rounded-full shadow-glow-orange-md"
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{d.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
