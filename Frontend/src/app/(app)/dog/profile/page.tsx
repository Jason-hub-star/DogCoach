'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Heart, AlertTriangle, BookOpen, Target, Dog, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDogProfile, useUpdateDogProfile } from '@/hooks/useQueries';
import { PremiumBackground } from '@/components/shared/ui/PremiumBackground';
import { getLabel } from '@/lib/survey-labels';

export default function DogProfilePage() {
    const router = useRouter();
    const { token } = useAuth();
    const { data: profile, isLoading } = useDogProfile(token);
    const updateMutation = useUpdateDogProfile(token);

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        name: '',
        breed: '',
        birth_date: '',
        sex: '',
        household_info: {} as any,
        health_meta: {} as any,
        rewards_meta: {} as any,
        chronic_issues: {} as any,
        triggers: {} as any,
        past_attempts: {} as any,
        temperament: {} as any,
    });

    const handleStartEdit = () => {
        if (!profile) return;
        setEditedData({
            name: profile.basic.name || '',
            breed: profile.basic.breed || '',
            birth_date: profile.basic.birth_date || '',
            sex: profile.basic.sex || '',
            household_info: profile.environment || {},
            health_meta: profile.health || {},
            rewards_meta: profile.rewards || {},
            chronic_issues: profile.behavior?.chronic_issues || {},
            triggers: profile.behavior?.triggers || {},
            past_attempts: profile.past_attempts || {},
            temperament: profile.temperament || {},
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(editedData);
            setIsEditing(false);
        } catch (error) {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 font-bold">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen pb-32 relative">
                <PremiumBackground />

                <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-md border-b border-white/60 px-6 py-5">
                    <div className="container mx-auto max-w-4xl flex items-center gap-4">
                        <button onClick={() => router.push('/settings')} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div>
                            <span className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em]">Profile</span>
                            <h1 className="text-2xl font-black text-slate-800">반려견 프로필</h1>
                        </div>
                    </div>
                </header>

                <div className="min-h-[60vh] flex items-center justify-center px-6">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Dog className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">
                            등록된 반려견이 없습니다
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            설문을 완료하고 반려견을 등록해주세요
                        </p>
                        <button
                            onClick={() => router.push('/survey')}
                            className="px-6 py-3 bg-brand-lime text-white font-black rounded-2xl hover:shadow-xl transition-all"
                        >
                            설문 시작하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { basic, environment, health, rewards, behavior, temperament, past_attempts } = profile;

    // Calculate age from birth_date
    const getAge = (birthDate?: string) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        return age;
    };

    const age = getAge(basic.birth_date);

    return (
        <div className="min-h-screen pb-32 relative">
            <PremiumBackground />

            {/* Glass Header */}
            <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-md border-b border-white/60 px-6 py-5">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/settings')} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div>
                            <span className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em]">Profile</span>
                            <h1 className="text-2xl font-black text-slate-800">반려견 프로필</h1>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={handleStartEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white rounded-xl transition-all shadow-sm font-bold text-sm text-gray-700 hover:text-brand-lime"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>수정</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-gray-100 rounded-xl transition-all shadow-sm font-bold text-sm text-gray-600"
                            >
                                <X className="w-4 h-4" />
                                <span>취소</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-lime hover:bg-brand-lime/90 rounded-xl transition-all shadow-sm font-bold text-sm text-white disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                <span>{updateMutation.isPending ? '저장 중...' : '저장'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="px-6 py-10 container mx-auto max-w-4xl space-y-10 relative z-10">
                {/* Hero Card - Basic Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] p-8 shadow-xl border border-gray-100"
                >
                    <div className="flex items-center gap-6">
                        {/* Profile Image */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-brand-lime/20 flex-shrink-0">
                            {basic.profile_image_url ? (
                                <img src={basic.profile_image_url} alt={basic.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-brand-lime/20 to-emerald-100 flex items-center justify-center">
                                    <Dog className="w-12 h-12 text-brand-lime" />
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-4">
                            {!isEditing ? (
                                <>
                                    <h2 className="text-3xl font-black text-slate-800">{basic.name}</h2>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                        {basic.breed && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 font-medium">견종</span>
                                                <span className="font-bold text-slate-800">{basic.breed}</span>
                                            </div>
                                        )}
                                        {basic.birth_date && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 font-medium">생년월일</span>
                                                <span className="font-bold text-slate-800">{basic.birth_date}</span>
                                            </div>
                                        )}
                                        {basic.sex && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 font-medium">성별</span>
                                                <span className="font-bold text-slate-800">{basic.sex}</span>
                                            </div>
                                        )}
                                        {age !== null && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 font-medium">나이</span>
                                                <span className="font-bold text-slate-800">{age}세</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">이름</label>
                                        <input
                                            type="text"
                                            value={editedData.name}
                                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-bold text-slate-800"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">견종</label>
                                            <input
                                                type="text"
                                                value={editedData.breed}
                                                onChange={(e) => setEditedData({ ...editedData, breed: e.target.value })}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">생년월일</label>
                                            <input
                                                type="date"
                                                value={editedData.birth_date}
                                                onChange={(e) => setEditedData({ ...editedData, birth_date: e.target.value })}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">성별</label>
                                        <select
                                            value={editedData.sex}
                                            onChange={(e) => setEditedData({ ...editedData, sex: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800"
                                        >
                                            <option value="">선택</option>
                                            <option value="MALE">수컷</option>
                                            <option value="FEMALE">암컷</option>
                                            <option value="MALE_NEUTERED">수컷 (중성화)</option>
                                            <option value="FEMALE_NEUTERED">암컷 (중성화)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Bento Grid Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Environment Section */}
                    {(environment && Object.keys(environment).length > 0) || isEditing ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/70 backdrop-blur-sm rounded-[2rem] p-6 shadow-lg border border-gray-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-lime/10 flex items-center justify-center">
                                    <Home className="w-5 h-5 text-brand-lime" />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">환경</h3>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-3">
                                    {environment.type && (
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">주거 형태</span>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {environment.type === 'HOUSE' ? '주택' : environment.type === 'APARTMENT' ? '아파트' : environment.type}
                                            </p>
                                        </div>
                                    )}
                                    {environment.family_count && (
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">가족 구성원</span>
                                            <p className="text-sm text-gray-700 mt-1">{environment.family_count}명</p>
                                        </div>
                                    )}
                                    {environment.primary_carer && (
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">주 돌봄이</span>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {typeof environment.primary_carer === 'string'
                                                    ? getLabel(environment.primary_carer, 'carer')
                                                    : (typeof environment.primary_carer === 'object' && environment.primary_carer?.ids)
                                                        ? environment.primary_carer.ids.map((id: string) => getLabel(id, 'carer')).join(', ')
                                                        : (typeof environment.primary_carer === 'object' && environment.primary_carer?.other_text)
                                                            ? environment.primary_carer.other_text
                                                            : '정보 없음'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">주거 형태</label>
                                        <select
                                            value={editedData.household_info?.type || ''}
                                            onChange={(e) => setEditedData({
                                                ...editedData,
                                                household_info: { ...editedData.household_info, type: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800"
                                        >
                                            <option value="">선택</option>
                                            <option value="HOUSE">주택</option>
                                            <option value="APARTMENT">아파트</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">가족 구성원 (명)</label>
                                        <input
                                            type="number"
                                            value={editedData.household_info?.family_count || ''}
                                            onChange={(e) => setEditedData({
                                                ...editedData,
                                                household_info: { ...editedData.household_info, family_count: parseInt(e.target.value) || 0 }
                                            })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">주 돌봄이</label>
                                        <input
                                            type="text"
                                            value={
                                                typeof editedData.household_info?.primary_carer === 'string'
                                                    ? editedData.household_info.primary_carer
                                                    : (typeof editedData.household_info?.primary_carer === 'object' && editedData.household_info.primary_carer?.other_text)
                                                        ? editedData.household_info.primary_carer.other_text
                                                        : ''
                                            }
                                            onChange={(e) => setEditedData({
                                                ...editedData,
                                                household_info: { ...editedData.household_info, primary_carer: e.target.value }
                                            })}
                                            placeholder="예: 어머니"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : null}

                    {/* Health Section */}
                    {((health && Object.keys(health).length > 0) || (rewards && Object.keys(rewards).length > 0) || isEditing) ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/70 backdrop-blur-sm rounded-[2rem] p-6 shadow-lg border border-gray-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">건강</h3>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-3">
                                    {health?.ids && Array.isArray(health.ids) && health.ids.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">건강 이슈</span>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {health.ids.map((issue: any, i: number) => {
                                                    const issueId = typeof issue === 'string' ? issue : issue?.id || issue?.name;
                                                    return (
                                                        <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                                                            {getLabel(issueId, 'health')}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {rewards?.ids && Array.isArray(rewards.ids) && rewards.ids.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">좋아하는 간식</span>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {rewards.ids.map((reward: any, i: number) => {
                                                    const rewardId = typeof reward === 'string' ? reward : reward?.id || reward?.name;
                                                    return (
                                                        <span key={i} className="px-3 py-1 bg-brand-lime/10 text-brand-lime rounded-full text-xs font-bold">
                                                            {getLabel(rewardId, 'reward')}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {(!health?.ids || health.ids.length === 0) && (!rewards?.ids || rewards.ids.length === 0) && (
                                        <p className="text-sm text-gray-400">특이사항 없음</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">건강 이슈</label>
                                        <textarea
                                            value={(() => {
                                                const ids = editedData.health_meta?.ids || [];
                                                return Array.isArray(ids) ? ids.map((id: string) => getLabel(id, 'health')).join(', ') : '';
                                            })()}
                                            onChange={(e) => {
                                                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                                setEditedData({
                                                    ...editedData,
                                                    health_meta: { ...editedData.health_meta, ids: values }
                                                });
                                            }}
                                            placeholder="예: 알레르기, 관절 문제 (쉼표로 구분)"
                                            rows={2}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">좋아하는 간식</label>
                                        <textarea
                                            value={(() => {
                                                const ids = editedData.rewards_meta?.ids || [];
                                                return Array.isArray(ids) ? ids.map((id: string) => getLabel(id, 'reward')).join(', ') : '';
                                            })()}
                                            onChange={(e) => {
                                                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                                setEditedData({
                                                    ...editedData,
                                                    rewards_meta: { ...editedData.rewards_meta, ids: values }
                                                });
                                            }}
                                            placeholder="예: 치킨, 간, 껌 (쉼표로 구분)"
                                            rows={2}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800 resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : null}

                    {/* Behavior Section */}
                    {(() => {
                        if (isEditing) return true;
                        if (!behavior) return false;
                        const issues = Array.isArray(behavior.chronic_issues)
                            ? behavior.chronic_issues
                            : (behavior.chronic_issues as any)?.top_issues || [];
                        const triggers = Array.isArray(behavior.triggers)
                            ? behavior.triggers
                            : (behavior.triggers as any)?.ids || [];
                        return (issues.length > 0 || triggers.length > 0);
                    })() && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/70 backdrop-blur-sm rounded-[2rem] p-6 shadow-lg border border-gray-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">행동</h3>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-3">
                                    {(() => {
                                        const issues = Array.isArray(behavior.chronic_issues)
                                            ? behavior.chronic_issues
                                            : (!Array.isArray(behavior.chronic_issues) && (behavior.chronic_issues as any)?.top_issues) || [];
                                        return issues.length > 0 && (
                                            <div>
                                                <span className="text-xs font-bold text-gray-500 uppercase">문제 행동</span>
                                                <ul className="mt-2 space-y-1">
                                                    {issues.map((issue: any, i: number) => {
                                                        const issueId = typeof issue === 'string' ? issue : issue?.id || issue?.name;
                                                        return (
                                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                                <span className="text-orange-500 mt-1">•</span>
                                                                <span>{getLabel(issueId, 'issue')}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    })()}

                                    {(() => {
                                        const triggers = Array.isArray(behavior.triggers)
                                            ? behavior.triggers
                                            : (!Array.isArray(behavior.triggers) && (behavior.triggers as any)?.ids) || [];
                                        return triggers.length > 0 && (
                                            <div>
                                                <span className="text-xs font-bold text-gray-500 uppercase">트리거</span>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    {triggers.map((trigger: any, i: number) => {
                                                        const triggerId = typeof trigger === 'string' ? trigger : trigger?.id || trigger?.name;
                                                        return (
                                                            <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
                                                                {getLabel(triggerId, 'trigger')}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">문제 행동</label>
                                        <textarea
                                            value={(() => {
                                                const issues = editedData.chronic_issues?.top_issues || [];
                                                return Array.isArray(issues) ? issues.map((id: string) => getLabel(id, 'issue')).join(', ') : '';
                                            })()}
                                            onChange={(e) => {
                                                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                                setEditedData({
                                                    ...editedData,
                                                    chronic_issues: { ...editedData.chronic_issues, top_issues: values }
                                                });
                                            }}
                                            placeholder="예: 과도한 짖음, 분리불안, 공격성 (쉼표로 구분)"
                                            rows={2}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">트리거</label>
                                        <textarea
                                            value={(() => {
                                                const triggers = editedData.triggers?.ids || [];
                                                return Array.isArray(triggers) ? triggers.map((id: string) => getLabel(id, 'trigger')).join(', ') : '';
                                            })()}
                                            onChange={(e) => {
                                                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                                setEditedData({
                                                    ...editedData,
                                                    triggers: { ...editedData.triggers, ids: values }
                                                });
                                            }}
                                            placeholder="예: 초인종, 분리(혼자 남겨짐), 낯선 사람 (쉼표로 구분)"
                                            rows={2}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800 resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Past Attempts Section */}
                    {(() => {
                        if (isEditing) return true;
                        const attempts = Array.isArray(past_attempts)
                            ? past_attempts
                            : (past_attempts as any)?.ids || [];
                        return attempts.length > 0;
                    })() && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/70 backdrop-blur-sm rounded-[2rem] p-6 shadow-lg border border-gray-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">과거 훈련 시도</h3>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-3">
                                    {(() => {
                                        const attempts = Array.isArray(past_attempts)
                                            ? past_attempts
                                            : (past_attempts as any)?.ids || [];
                                        return attempts.map((attempt: any, i: number) => {
                                            const attemptId = typeof attempt === 'string' ? attempt : attempt?.id || attempt?.name;
                                            return (
                                                <div key={i} className="p-3 bg-blue-50/50 rounded-xl">
                                                    <p className="text-sm text-gray-700">{getLabel(attemptId, 'attempt')}</p>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">시도한 훈련 방법</label>
                                    <textarea
                                        value={(() => {
                                            const attempts = editedData.past_attempts?.ids || [];
                                            return Array.isArray(attempts) ? attempts.map((id: string) => getLabel(id, 'attempt')).join(', ') : '';
                                        })()}
                                        onChange={(e) => {
                                            const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                            setEditedData({
                                                ...editedData,
                                                past_attempts: { ...editedData.past_attempts, ids: values }
                                            });
                                        }}
                                        placeholder="예: 무시하기, 긍정 강화, 전문가 상담 (쉼표로 구분)"
                                        rows={2}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-lime focus:outline-none font-medium text-slate-800 resize-none"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Temperament Section (Full Width) */}
                {((temperament && Object.keys(temperament).length > 0) || isEditing) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] p-8 shadow-xl border border-gray-100"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">기질 분석</h3>
                        </div>

                        {!isEditing ? (
                            temperament.sensitivity_score && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-gray-700">민감도</span>
                                        <span className="font-black text-brand-lime">{temperament.sensitivity_score}/10</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${temperament.sensitivity_score * 10}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-brand-lime to-emerald-400"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {temperament.sensitivity_score <= 3 && "둔감한 편입니다"}
                                        {temperament.sensitivity_score > 3 && temperament.sensitivity_score <= 7 && "보통 수준입니다"}
                                        {temperament.sensitivity_score > 7 && "매우 민감한 편입니다"}
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">민감도 (1-10)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={editedData.temperament?.sensitivity_score || 5}
                                            onChange={(e) => setEditedData({
                                                ...editedData,
                                                temperament: { ...editedData.temperament, sensitivity_score: parseInt(e.target.value) }
                                            })}
                                            className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                        />
                                        <span className="font-black text-brand-lime text-lg w-12 text-right">
                                            {editedData.temperament?.sensitivity_score || 5}/10
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {(editedData.temperament?.sensitivity_score || 5) <= 3 && "둔감한 편입니다"}
                                        {(editedData.temperament?.sensitivity_score || 5) > 3 && (editedData.temperament?.sensitivity_score || 5) <= 7 && "보통 수준입니다"}
                                        {(editedData.temperament?.sensitivity_score || 5) > 7 && "매우 민감한 편입니다"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
