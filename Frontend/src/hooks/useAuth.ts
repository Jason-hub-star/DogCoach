/**
 * 사용자 인증 상태를 관리하고 게스트 데이터 마이그레이션을 처리하는 커스텀 훅입니다.
 * Supabase 세션 감지 및 API 클라이언트 토큰 연동 기능을 수행합니다.
 */
/**
 * 서버 데이터 페칭 및 상태 관리를 위한 TanStack Query(React Query) 훅 집합입니다.
 * 대시보드, 행동 로그, 코칭 상태 및 AI 추천 데이터의 CRUD 로직을 포함합니다.
 */
import { useEffect, useState, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasStoredSessionHint, setHasStoredSessionHint] = useState(false);
    const migrationAttempted = useRef(false);

    useEffect(() => {
        const hasAuthTokenInStorage = () => {
            if (typeof window === "undefined") return false;
            try {
                const keys = Object.keys(window.localStorage || {});
                const tokenKey = keys.find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
                if (!tokenKey) return false;
                const raw = localStorage.getItem(tokenKey);
                if (!raw) return false;
                const parsed = JSON.parse(raw);
                const accessToken = parsed?.access_token || parsed?.currentSession?.access_token || null;
                return Boolean(accessToken);
            } catch {
                return false;
            }
        };

        setHasStoredSessionHint(hasAuthTokenInStorage());

        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            if (session) {
                setUser(session.user);
                setToken(session.access_token);
                setHasStoredSessionHint(true);
                setLoading(false);
                // Attempt migration if this is a real user (not anonymous)
                if (!session.user.is_anonymous && !migrationAttempted.current) {
                    attemptMigration(session.access_token);
                }
            } else {
                // 2. No session — continue as guest (anonymous auth disabled)
                setLoading(false);
            }
        });

        // 3. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            if (session) {
                setUser(session.user);
                setToken(session.access_token);
                setHasStoredSessionHint(true);
                setLoading(false);
                // Migrate guest data on real user sign-in
                if (!session.user.is_anonymous && !migrationAttempted.current) {
                    attemptMigration(session.access_token);
                }
            } else {
                setUser(null);
                setToken(null);
                setHasStoredSessionHint(false);
                migrationAttempted.current = false;
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const attemptMigration = async (accessToken: string) => {
        migrationAttempted.current = true;
        try {
            await apiClient.post('/auth/migrate-guest', {}, {
                token: accessToken,
                credentials: 'include',
            });
        } catch (err) {
            // Migration is best-effort; log but don't block user experience
            console.warn("Guest migration:", err);
        }
    };

    return { user, token, loading, hasStoredSessionHint };
}
