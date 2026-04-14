'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/shared/modals/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteAccount } from '@/hooks/useQueries';

interface Props {
    isPro?: boolean;
}

import { motion } from 'framer-motion';
import { Database, Download, ExternalLink, AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DataSection({ isPro = false }: Props) {
    const router = useRouter();
    const { token } = useAuth();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const deleteMutation = useDeleteAccount(token);

    const handleDeleteAccount = async () => {
        try {
            await deleteMutation.mutateAsync();
            // Clear local auth state
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('sb-refresh-token');
            // Redirect to landing page
            router.push('/');
        } catch (error) {
            console.error('Account deletion failed:', error);
            alert('계정 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <Database className="w-5 h-5 text-brand-lime" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight">데이터 및 관리</h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-sm ring-1 ring-black/5"
            >
                <div className="space-y-10">
                    <div className="flex items-center justify-between group">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-black text-slate-800 tracking-tight">반려견 프로필 관리</h3>
                            <p className="text-xs font-bold text-gray-500">등록된 강아지 정보를 수정하거나 업데이트합니다.</p>
                        </div>
                        <button
                            onClick={() => router.push('/dog/profile')}
                            className="bg-white/60 border border-white/80 p-3 rounded-2xl text-gray-500 hover:bg-white hover:text-brand-lime transition-all shadow-sm group-hover:scale-105"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-slate-800 tracking-tight">기록 데이터 내보내기</h3>
                                {!isPro && (
                                    <span className="bg-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-gray-200/50 flex items-center gap-1">
                                        Professional Edition
                                    </span>
                                )}
                            </div>
                            <p className="text-xs font-bold text-gray-500">최근 30일간의 모든 훈련 기록을 PDF로 보관합니다.</p>
                        </div>
                        <button
                            disabled={!isPro}
                            className={cn(
                                "p-3 rounded-2xl transition-all shadow-sm",
                                isPro
                                    ? "bg-white/60 border border-white/80 text-brand-lime hover:bg-white hover:shadow-brand-lime/10 group-hover:scale-110"
                                    : "bg-gray-50/50 border-gray-100/50 text-gray-200 cursor-not-allowed"
                            )}
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-[2.5rem] border border-red-100 bg-red-50/20 backdrop-blur-sm shadow-sm ring-1 ring-red-900/5 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    <AlertTriangle className="w-32 h-32 text-red-500" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-black text-red-600 tracking-tight flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Critical Area
                        </h3>
                        <p className="text-xs font-bold text-red-500/80 max-w-[200px] break-keep">
                            모든 계정 활동과 훈련 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                        </p>
                    </div>
                    <button
                        onClick={() => setDeleteDialogOpen(true)}
                        className="bg-red-500 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                        전체 데이터 초기화
                    </button>
                </div>
            </motion.div>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteAccount}
                title="정말 삭제하시겠습니까?"
                message="모든 계정 활동과 훈련 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다."
                confirmText="삭제"
                cancelText="취소"
                isDangerous={true}
            />
        </div>
    );
}
