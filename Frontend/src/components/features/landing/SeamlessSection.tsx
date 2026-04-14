"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function SeamlessSection() {
    const router = useRouter();
    const { user } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installHint, setInstallHint] = useState("");

    const isLoggedIn = !!user && !user.is_anonymous;

    useEffect(() => {
        const onBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        if (!deferredPrompt) {
            setInstallHint("브라우저 메뉴의 '홈 화면에 추가'를 사용해 설치할 수 있어요.");
            return;
        }

        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {
            setInstallHint("앱 설치가 시작되었습니다.");
        } else {
            setInstallHint("설치를 취소했습니다. 나중에 다시 시도할 수 있어요.");
        }

        setDeferredPrompt(null);
    };

    return (
        <section className="py-20 md:py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-[clamp(1.9rem,7vw,2.25rem)] md:text-4xl font-bold text-slate-800 mb-4 leading-tight break-keep text-balance-kr">
                        설치와 사용은 단순하게
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed break-keep text-pretty-kr">
                        앱 설치, 알림, 기록까지 한 화면에서 바로 시작할 수 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <div className="group relative overflow-hidden rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors p-8 md:p-12">
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-slate-800">
                                <Smartphone className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 break-keep text-balance-kr">
                                설치 없이 빠른 실행
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed break-keep text-pretty-kr">
                                로그인 후 홈 화면에 추가하면 앱처럼 바로 실행됩니다.
                            </p>

                            <button
                                type="button"
                                onClick={handleInstallClick}
                                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                            >
                                {isLoggedIn ? "PWA 설치하기" : "로그인 후 설치하기"}
                            </button>

                            {installHint ? (
                                <p className="mt-3 text-xs text-gray-500 leading-relaxed break-keep text-pretty-kr">{installHint}</p>
                            ) : (
                                <p className="mt-3 text-xs text-gray-500 leading-relaxed break-keep text-pretty-kr">
                                    {isLoggedIn
                                        ? "설치 팝업이 보이지 않으면 브라우저 메뉴에서 '홈 화면에 추가'를 선택하세요."
                                        : "설치 버튼을 누르면 로그인 페이지로 이동합니다."}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-3xl bg-kakao-yellow-soft p-8 md:p-12">
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center mb-6 text-kakao-brown">
                                <MessageCircle className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-kakao-brown mb-4 break-keep text-balance-kr">
                                카카오 알림 연동
                            </h3>
                            <p className="text-kakao-brown/80 mb-8 leading-relaxed break-keep text-pretty-kr">
                                훈련 시간, 복습 루틴, 기록 리마인더를 카카오 알림으로 받아보세요.
                            </p>
                            <div className="inline-block px-4 py-2 bg-white/40 rounded-full text-xs font-bold text-kakao-brown">
                                Pro 플랜 기능
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
