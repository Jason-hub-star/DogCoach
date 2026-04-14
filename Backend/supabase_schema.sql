-- ============================================
-- DogCoach Supabase Schema Migration
-- Generated from SQLAlchemy models.py
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUM TYPES
-- ============================================
CREATE TYPE user_role AS ENUM ('GUEST', 'USER', 'PRO_USER', 'EXPERT', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
CREATE TYPE plan_type AS ENUM ('FREE', 'PRO_MONTHLY', 'PRO_YEARLY');
CREATE TYPE dog_sex AS ENUM ('MALE', 'FEMALE', 'MALE_NEUTERED', 'FEMALE_NEUTERED');
CREATE TYPE asset_type AS ENUM ('PHOTO', 'VIDEO', 'LOTTIE_SNAPSHOT');
CREATE TYPE report_type AS ENUM ('DAILY', 'WEEKLY', 'INSIGHT');
CREATE TYPE noti_channel AS ENUM ('ALIMTALK', 'WEB_PUSH', 'EMAIL');

-- ============================================
-- 2. TABLES
-- ============================================

-- users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kakao_sync_id VARCHAR(255) UNIQUE,
    role user_role DEFAULT 'GUEST',
    phone_number VARCHAR(255),
    status user_status DEFAULT 'ACTIVE',
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_login_at TIMESTAMPTZ,
    provider VARCHAR
);
CREATE INDEX idx_users_kakao_sync_id ON users(kakao_sync_id);

-- subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type plan_type DEFAULT 'FREE',
    next_billing_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    pg_provider VARCHAR,
    pg_customer_key VARCHAR,
    canceled_at TIMESTAMPTZ,
    cancel_reason TEXT
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- dogs
CREATE TABLE dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255),
    birth_date DATE,
    sex dog_sex,
    profile_image_url TEXT,
    anonymous_sid VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_dogs_user_id ON dogs(user_id);
CREATE INDEX idx_dogs_user_created_desc ON dogs(user_id, created_at DESC);
CREATE INDEX idx_dogs_anonymous_sid_created_desc ON dogs(anonymous_sid, created_at DESC);

-- dog_env
CREATE TABLE dog_env (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID UNIQUE REFERENCES dogs(id) ON DELETE CASCADE,
    household_info JSONB,
    health_meta JSONB,
    profile_meta JSONB,
    rewards_meta JSONB,
    chronic_issues JSONB,
    antecedents JSONB,
    triggers JSONB,
    past_attempts JSONB,
    temperament JSONB,
    activity_meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_dog_env_dog_id ON dog_env(dog_id);

-- behavior_logs
CREATE TABLE behavior_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
    is_quick_log BOOLEAN DEFAULT FALSE,
    type_id INTEGER,
    antecedent TEXT,
    behavior TEXT,
    consequence TEXT,
    intensity INTEGER,
    duration INTEGER,
    occurred_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_behavior_logs_dog_id ON behavior_logs(dog_id);
CREATE INDEX idx_logs_dog_occurred ON behavior_logs(dog_id, occurred_at);

-- media_assets
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID REFERENCES behavior_logs(id) ON DELETE SET NULL,
    storage_url TEXT NOT NULL,
    asset_type asset_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_media_assets_log_id ON media_assets(log_id);

-- ai_coaching
CREATE TABLE ai_coaching (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    analysis_json JSONB,
    action_items JSONB,
    feedback_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ai_coaching_dog_id ON ai_coaching(dog_id);

-- action_tracker
CREATE TABLE action_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coaching_id UUID REFERENCES ai_coaching(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_action_tracker_coaching_id ON action_tracker(coaching_id);

-- noti_history
CREATE TABLE noti_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel noti_channel NOT NULL,
    template_code VARCHAR(100),
    sent_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ
);
CREATE INDEX idx_noti_history_user_id ON noti_history(user_id);

-- log_summaries
CREATE TABLE log_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    summary_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_log_summaries_dog_id ON log_summaries(dog_id);

-- user_settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notification_pref JSONB,
    ai_persona JSONB,
    marketing_agreed BOOLEAN DEFAULT FALSE,
    marketing_agreed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ============================================
-- 3. RLS (Row Level Security) - Enable on all tables
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_env ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE noti_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS Policies - Service role bypass (Backend API uses service_role key)
-- ============================================
-- Allow service_role full access (backend API)
CREATE POLICY "Service role full access" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON dogs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON dog_env FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON behavior_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON media_assets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON ai_coaching FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON action_tracker FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON noti_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON log_summaries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON user_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can read their own data
CREATE POLICY "Users read own data" ON users FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users read own subscriptions" ON subscriptions FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users read own dogs" ON dogs FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users read own settings" ON user_settings FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users read own notifications" ON noti_history FOR SELECT USING ((select auth.uid()) = user_id);

-- ============================================
-- 5. updated_at auto-trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dogs_updated_at BEFORE UPDATE ON dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dog_env_updated_at BEFORE UPDATE ON dog_env FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_behavior_logs_updated_at BEFORE UPDATE ON behavior_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_action_tracker_updated_at BEFORE UPDATE ON action_tracker FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Phase 7: AI Recommendation System Tables
-- ============================================

CREATE TABLE ai_recommendation_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    anonymous_sid VARCHAR(255),
    window_days INTEGER NOT NULL,
    dedupe_key VARCHAR(64) NOT NULL UNIQUE,
    prompt_version VARCHAR(20) NOT NULL DEFAULT 'PROMPT_V1',
    model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini',
    summary_hash VARCHAR(64) NOT NULL,
    issue VARCHAR(100) NOT NULL,
    recommendations JSONB NOT NULL,
    rationale TEXT NOT NULL,
    period_comparison TEXT,
    source VARCHAR(20) NOT NULL DEFAULT 'ai',
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_usd NUMERIC(10,6) DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rec_dog_window_created ON ai_recommendation_snapshots(dog_id, window_days, created_at DESC);
CREATE INDEX idx_rec_user_created ON ai_recommendation_snapshots(user_id, created_at);
CREATE INDEX idx_rec_expires ON ai_recommendation_snapshots(expires_at);

CREATE TABLE ai_recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES ai_recommendation_snapshots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    anonymous_sid VARCHAR(255),
    recommendation_index INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_feedback_snapshot ON ai_recommendation_feedback(snapshot_id);

CREATE TABLE ai_cost_usage_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usage_date DATE NOT NULL UNIQUE,
    total_calls INTEGER DEFAULT 0,
    total_input_tokens INTEGER DEFAULT 0,
    total_output_tokens INTEGER DEFAULT 0,
    total_cost_usd NUMERIC(10,6) DEFAULT 0,
    rule_fallback_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_cost_usage_monthly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usage_month DATE NOT NULL UNIQUE,
    total_calls INTEGER DEFAULT 0,
    total_cost_usd NUMERIC(10,6) DEFAULT 0,
    budget_limit_usd NUMERIC(10,2) DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE ai_recommendation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_usage_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON ai_recommendation_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON ai_recommendation_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON ai_cost_usage_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON ai_cost_usage_monthly FOR ALL TO service_role USING (true) WITH CHECK (true);

-- updated_at triggers for cost tables
CREATE TRIGGER trg_ai_cost_daily_updated_at BEFORE UPDATE ON ai_cost_usage_daily FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ai_cost_monthly_updated_at BEFORE UPDATE ON ai_cost_usage_monthly FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Hotfix: user_training_status (for coach/status)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'training_status') THEN
        CREATE TYPE training_status AS ENUM (
            'COMPLETED',
            'SKIPPED_INEFFECTIVE',
            'SKIPPED_ALREADY_DONE',
            'HIDDEN_BY_AI'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS user_training_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    curriculum_id VARCHAR(50) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    status training_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_training_status_user_id ON user_training_status(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_training_status_unique_step
    ON user_training_status(user_id, curriculum_id, stage_id, step_number);

ALTER TABLE user_training_status ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'user_training_status'
          AND policyname = 'Service role full access'
    ) THEN
        CREATE POLICY "Service role full access"
            ON user_training_status
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END$$;

-- ============================================
-- 8. Training Behavior Snapshots (for before/after comparison)
-- ============================================

CREATE TABLE IF NOT EXISTS training_behavior_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    curriculum_id VARCHAR(50) NOT NULL,
    snapshot_date DATE NOT NULL,
    total_logs INTEGER DEFAULT 0,
    avg_intensity NUMERIC(4,2) DEFAULT 0,
    log_frequency_per_week NUMERIC(4,2) DEFAULT 0,
    trigger_distribution JSONB DEFAULT '{}',
    hourly_distribution JSONB DEFAULT '{}',
    weekly_distribution JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_behavior_snapshot_unique
    ON training_behavior_snapshots(user_id, dog_id, curriculum_id);

-- Allow time-series snapshots (multiple rows per curriculum over time)
DROP INDEX IF EXISTS idx_behavior_snapshot_unique;
CREATE INDEX IF NOT EXISTS idx_behavior_snapshot_user_dog_curriculum
    ON training_behavior_snapshots(user_id, dog_id, curriculum_id);
CREATE INDEX IF NOT EXISTS idx_behavior_snapshot_created_at
    ON training_behavior_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_behavior_snapshot_user_dog_curriculum_snapshot_date
    ON training_behavior_snapshots(user_id, dog_id, curriculum_id, snapshot_date DESC);

ALTER TABLE training_behavior_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'training_behavior_snapshots'
          AND policyname = 'Service role full access'
    ) THEN
        CREATE POLICY "Service role full access"
            ON training_behavior_snapshots
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END$$;
