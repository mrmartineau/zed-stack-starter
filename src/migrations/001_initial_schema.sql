-- ============================================================================
-- Database Schema Migration: 001_initial_schema
-- Description: Creates the initial schema for user management, including
-- UUID extension and the users table. Emails are enforced globally unique.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES: Users
-- ============================================================================

-- Table: users
-- Columns:
--   - id: UUID primary key, generated with gen_random_uuid()
--   - email: varchar(255), required, must be globally unique
--   - name: varchar(255), required
--   - created_at: timestamp with timezone, defaults to current time
--   - updated_at: timestamp with timezone, defaults to current time
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(email)
);

-- ============================================================================
-- Trigger-based function for Supabase Auth integration
-- ============================================================================

-- It automatically creates a user record when someone signs up via auth.users.
-- The name is extracted from user metadata (raw_user_meta_data).

CREATE OR REPLACE FUNCTION handle_auth_user_created()
RETURNS TRIGGER AS $$
DECLARE
    v_name VARCHAR(255);
BEGIN
    -- Extract name from auth metadata, fallback to email prefix
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Create the user record (organization can be assigned later)
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        v_name
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_auth_user_created();

COMMENT ON FUNCTION handle_auth_user_created IS
'Trigger function that automatically creates a user record when a new user signs up via Supabase Auth.
Organization assignment happens later in the user flow.';
