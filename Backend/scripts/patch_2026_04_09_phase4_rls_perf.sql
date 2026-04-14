-- Patch date: 2026-04-09
-- Purpose:
--   1) Reduce RLS performance warnings by scoping "Service role full access" policies to TO service_role.
--   2) Convert auth.uid() policy predicates to initplan-friendly form using (select auth.uid()).
--   3) Fix mutable search_path warning on update_updated_at_column().
-- Safe to run multiple times.

BEGIN;

DO $$
DECLARE
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'users',
        'subscriptions',
        'dogs',
        'dog_env',
        'behavior_logs',
        'media_assets',
        'ai_coaching',
        'action_tracker',
        'noti_history',
        'log_summaries',
        'user_settings',
        'ai_recommendation_snapshots',
        'ai_recommendation_feedback',
        'ai_cost_usage_daily',
        'ai_cost_usage_monthly',
        'user_training_status',
        'training_behavior_snapshots'
    ]
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON public.%I', tbl);
        EXECUTE format(
            'CREATE POLICY "Service role full access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
            tbl
        );
    END LOOP;
END $$;

DROP POLICY IF EXISTS "Users read own data" ON public.users;
CREATE POLICY "Users read own data"
    ON public.users
    FOR SELECT
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users read own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users read own dogs" ON public.dogs;
CREATE POLICY "Users read own dogs"
    ON public.dogs
    FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users read own settings" ON public.user_settings;
CREATE POLICY "Users read own settings"
    ON public.user_settings
    FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users read own notifications" ON public.noti_history;
CREATE POLICY "Users read own notifications"
    ON public.noti_history
    FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMIT;
