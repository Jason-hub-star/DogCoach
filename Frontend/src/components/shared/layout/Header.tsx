/**
 * 대시보드의 코어 탭 영역을 렌더링하는 메인 컴포넌트입니다.
 * 퀵 로그 위젯과 최근 로그 리스트를 조합하여 사용자에게 요약된 정보를 제공합니다.
 */
"use client";

import Link from "next/link";
import { Menu, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDogProfile } from "@/hooks/useQueries";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/**
 * 대시보드 및 페이지 상단에 위치하는 공통 헤더 컴포넌트입니다.
 * 사용자 프로필, 강아지 선택 및 알림 등 전역 내비게이션 기능을 포함합니다.
 */
export function Header() {
    const router = useRouter();
    const { user, token, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
    };

    const isLoggedIn = !!user && !user.is_anonymous;
    const { data: dogProfile } = useDogProfile(token);
    const hasDog = isLoggedIn && !!dogProfile?.basic?.id;

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 pt-[env(safe-area-inset-top)] transition-all">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            className="w-10 h-10 rounded-2xl bg-brand-lime flex items-center justify-center shadow-lg shadow-brand-lime/20"
                        >
                            <span className="text-white text-xl">🐾</span>
                        </motion.div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight font-outfit group-hover:text-brand-lime transition-colors">
                            TailLog
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/#service-intro" className="text-gray-600 hover:text-brand-lime transition-colors text-sm font-medium">
                        서비스 소개
                    </Link>
                    <Link href="/#pricing" className="text-gray-600 hover:text-brand-lime transition-colors text-sm font-medium">
                        요금제
                    </Link>

                    {loading ? (
                        // Loading Skeleton
                        <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                    ) : isLoggedIn ? (
                        // User Dropdown
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 text-gray-700 hover:text-brand-lime transition-colors font-medium px-2 py-1 rounded-lg hover:bg-gray-50"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <UserIcon className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="text-sm">내 계정</span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs text-gray-500">로그인 계정</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        대시보드
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-gray-600 hover:text-brand-lime transition-colors text-sm font-medium">
                            로그인
                        </Link>
                    )}

                    <Link
                        href={hasDog ? "/dashboard" : "/survey"}
                        className="px-5 py-2 rounded-full bg-brand-dark text-white text-sm font-bold hover:bg-slate-700 transition-colors"
                    >
                        {hasDog ? "내 대시보드로 이동" : "무료로 시작하기"}
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="flex flex-col p-4 space-y-4">
                        <Link href="/#service-intro" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                            서비스 소개
                        </Link>
                        <Link href="/#pricing" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                            요금제
                        </Link>

                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className="text-slate-800 font-bold flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                                    <LayoutDashboard className="w-4 h-4" />
                                    대시보드
                                </Link>
                                <button onClick={handleLogout} className="text-red-500 font-medium flex items-center gap-2 text-left">
                                    <LogOut className="w-4 h-4" />
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>로그인</Link>
                        )}

                        <Link
                            href={hasDog ? "/dashboard" : "/survey"}
                            className="block text-center py-3 rounded-xl bg-brand-lime text-white font-bold"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {hasDog ? "내 대시보드로 이동" : "무료로 시작하기"}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
