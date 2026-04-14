-- Patch date: 2026-04-09
-- Purpose: Add hot-path composite indexes for latest dog lookups and training snapshot timeline queries.
-- Safe to run multiple times.

CREATE INDEX IF NOT EXISTS idx_dogs_user_created_desc
ON public.dogs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dogs_anonymous_sid_created_desc
ON public.dogs(anonymous_sid, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_behavior_snapshot_user_dog_curriculum_snapshot_date
ON public.training_behavior_snapshots(user_id, dog_id, curriculum_id, snapshot_date DESC);
