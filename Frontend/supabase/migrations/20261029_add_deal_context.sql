-- ==============================================================================
-- Migration: Add deal_context to analyses table
-- Execute this single statement in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/agbqvszmpkedlkbyefzq/sql/new
-- ==============================================================================

ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS deal_context JSONB DEFAULT '{}'::jsonb;

