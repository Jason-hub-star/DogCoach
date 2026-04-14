-- Patch date: 2026-04-09
-- Purpose:
--   1) Convert remaining direct auth.uid()/auth.role() policy calls to initplan-friendly form.
--   2) Remove duplicate unique index on ai_recommendation_snapshots(dedupe_key).
-- Safe to run multiple times.
-- Notes:
--   - This script preserves existing '(select auth.uid())' / '(select auth.role())' calls
--     and only rewrites direct auth.uid()/auth.role() usages.
--   - Preflight backup query:
--     select schemaname, tablename, policyname, qual, with_check
--     from pg_policies
--     where schemaname = 'public'
--       and (qual ~* 'auth\.uid\(\)|auth\.role\(\)' or with_check ~* 'auth\.uid\(\)|auth\.role\(\)');

BEGIN;

DO $$
DECLARE
    policy_row record;
    patched_qual text;
    patched_with_check text;
    prev_expr text;
BEGIN
    FOR policy_row IN
        SELECT
            schemaname,
            tablename,
            policyname,
            qual,
            with_check
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (
              qual ~* 'auth\.uid\(\)|auth\.role\(\)'
           OR with_check ~* 'auth\.uid\(\)|auth\.role\(\)'
          )
    LOOP
        patched_qual := policy_row.qual;
        patched_with_check := policy_row.with_check;

        IF patched_qual IS NOT NULL THEN
            patched_qual := regexp_replace(
                patched_qual,
                '\([[:space:]]*select[[:space:]]+auth\.uid\(\)([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                '__AUTH_UID_INITPLAN__',
                'gi'
            );
            patched_qual := regexp_replace(
                patched_qual,
                '\([[:space:]]*select[[:space:]]+auth\.role\(\)([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                '__AUTH_ROLE_INITPLAN__',
                'gi'
            );

            LOOP
                prev_expr := patched_qual;
                patched_qual := regexp_replace(
                    patched_qual,
                    '\([[:space:]]*select[[:space:]]+__AUTH_UID_INITPLAN__([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                    '__AUTH_UID_INITPLAN__',
                    'gi'
                );
                patched_qual := regexp_replace(
                    patched_qual,
                    '\([[:space:]]*select[[:space:]]+__AUTH_ROLE_INITPLAN__([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                    '__AUTH_ROLE_INITPLAN__',
                    'gi'
                );
                EXIT WHEN patched_qual = prev_expr;
            END LOOP;

            patched_qual := regexp_replace(patched_qual, 'auth\.uid\(\)', '(select auth.uid())', 'gi');
            patched_qual := regexp_replace(patched_qual, 'auth\.role\(\)', '(select auth.role())', 'gi');
            patched_qual := replace(patched_qual, '__AUTH_UID_INITPLAN__', '(select auth.uid())');
            patched_qual := replace(patched_qual, '__AUTH_ROLE_INITPLAN__', '(select auth.role())');

            IF patched_qual IS DISTINCT FROM policy_row.qual THEN
                EXECUTE format(
                    'ALTER POLICY %I ON %I.%I USING (%s)',
                    policy_row.policyname,
                    policy_row.schemaname,
                    policy_row.tablename,
                    patched_qual
                );
            END IF;
        END IF;

        IF patched_with_check IS NOT NULL THEN
            patched_with_check := regexp_replace(
                patched_with_check,
                '\([[:space:]]*select[[:space:]]+auth\.uid\(\)([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                '__AUTH_UID_INITPLAN__',
                'gi'
            );
            patched_with_check := regexp_replace(
                patched_with_check,
                '\([[:space:]]*select[[:space:]]+auth\.role\(\)([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                '__AUTH_ROLE_INITPLAN__',
                'gi'
            );

            LOOP
                prev_expr := patched_with_check;
                patched_with_check := regexp_replace(
                    patched_with_check,
                    '\([[:space:]]*select[[:space:]]+__AUTH_UID_INITPLAN__([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                    '__AUTH_UID_INITPLAN__',
                    'gi'
                );
                patched_with_check := regexp_replace(
                    patched_with_check,
                    '\([[:space:]]*select[[:space:]]+__AUTH_ROLE_INITPLAN__([[:space:]]+as[[:space:]]+[a-z_][a-z0-9_]*)?[[:space:]]*\)',
                    '__AUTH_ROLE_INITPLAN__',
                    'gi'
                );
                EXIT WHEN patched_with_check = prev_expr;
            END LOOP;

            patched_with_check := regexp_replace(patched_with_check, 'auth\.uid\(\)', '(select auth.uid())', 'gi');
            patched_with_check := regexp_replace(patched_with_check, 'auth\.role\(\)', '(select auth.role())', 'gi');
            patched_with_check := replace(patched_with_check, '__AUTH_UID_INITPLAN__', '(select auth.uid())');
            patched_with_check := replace(patched_with_check, '__AUTH_ROLE_INITPLAN__', '(select auth.role())');

            IF patched_with_check IS DISTINCT FROM policy_row.with_check THEN
                EXECUTE format(
                    'ALTER POLICY %I ON %I.%I WITH CHECK (%s)',
                    policy_row.policyname,
                    policy_row.schemaname,
                    policy_row.tablename,
                    patched_with_check
                );
            END IF;
        END IF;
    END LOOP;
END $$;

DROP INDEX IF EXISTS public.idx_rec_dedupe_key;

COMMIT;
