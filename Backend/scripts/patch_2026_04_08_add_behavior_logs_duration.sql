-- Patch date: 2026-04-08
-- Purpose: Fix production schema drift where `behavior_logs.duration` column was missing.
-- Safe to run multiple times.

ALTER TABLE IF EXISTS public.behavior_logs
ADD COLUMN IF NOT EXISTS duration INTEGER;

