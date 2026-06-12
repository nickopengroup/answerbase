-- Answerbase — migration 0003: suggested questions per bot.
-- Generated from the bot's documents (Feature 2 of the onboarding spec) and
-- served to the in-app chat and the public widget. Safe to re-run.

alter table bots
  add column if not exists suggested_questions jsonb not null default '[]'::jsonb;
