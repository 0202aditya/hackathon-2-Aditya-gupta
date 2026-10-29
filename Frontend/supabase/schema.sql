-- ==============================================================================
-- Contract Auto-Redline: Supabase Database Schema & RLS Policies
-- Execute this entire script in the Supabase SQL Editor
-- ==============================================================================

-- 1. Profiles Table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  entity_type text,
  services text,
  typical_project_value text,
  jurisdiction text,
  non_negotiables text,
  allow_anonymous_log boolean default true,
  created_at timestamptz default now()
);

-- 2. Analyses Table
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  contract_type text,
  status text not null default 'processing', -- processing | completed | failed
  error_code text,
  overall_risk text,
  risk_score int,
  summary text,
  missing_protections jsonb default '[]',
  deal_context jsonb default '{}'::jsonb,
  raw_ai_output jsonb,
  model text,
  redacted boolean default false,
  created_at timestamptz default now()
);

-- 3. Clauses Table
create table if not exists clauses (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses on delete cascade,
  position int not null,
  clause_type text,
  title text,
  original_text text,
  risk_level text,
  explanation text,
  impact text,
  suggested_redline text,
  negotiation_priority int,
  normalized jsonb default '{}',
  user_decision text default 'pending', -- pending | accepted | rejected | edited
  edited_redline text
);

-- 4. Obligations Table
create table if not exists obligations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses on delete cascade,
  type text,
  description text,
  due_date date,
  notice_days int
);

-- 5. Benchmarks Table
create table if not exists benchmarks (
  clause_type text,
  metric text,
  typical_value text,
  note text,
  primary key (clause_type, metric)
);

-- 6. Anonymous Clause Log Table
create table if not exists clause_log (
  id uuid primary key default gen_random_uuid(),
  clause_type text,
  industry text,
  risk_level text,
  normalized jsonb,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_analyses_user_created on analyses (user_id, created_at desc);
create index if not exists idx_clauses_analysis_position on clauses (analysis_id, position);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table analyses enable row level security;
alter table clauses enable row level security;
alter table obligations enable row level security;
alter table benchmarks enable row level security;
alter table clause_log enable row level security;

-- Profiles: Users can view and update their own profile
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Analyses: Users can manage their own analyses
create policy "Users can view their own analyses"
  on analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
  on analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on analyses for delete
  using (auth.uid() = user_id);

-- Clauses: Access determined through the parent analysis ownership
create policy "Users can view clauses for their analyses"
  on clauses for select
  using (
    exists (
      select 1 from analyses
      where analyses.id = clauses.analysis_id
      and analyses.user_id = auth.uid()
    )
  );

create policy "Users can insert clauses for their analyses"
  on clauses for insert
  with check (
    exists (
      select 1 from analyses
      where analyses.id = clauses.analysis_id
      and analyses.user_id = auth.uid()
    )
  );

create policy "Users can update clauses for their analyses"
  on clauses for update
  using (
    exists (
      select 1 from analyses
      where analyses.id = clauses.analysis_id
      and analyses.user_id = auth.uid()
    )
  );

create policy "Users can delete clauses for their analyses"
  on clauses for delete
  using (
    exists (
      select 1 from analyses
      where analyses.id = clauses.analysis_id
      and analyses.user_id = auth.uid()
    )
  );

-- Obligations: Access determined through parent analysis ownership
create policy "Users can view obligations for their analyses"
  on obligations for select
  using (
    exists (
      select 1 from analyses
      where analyses.id = obligations.analysis_id
      and analyses.user_id = auth.uid()
    )
  );

create policy "Users can insert obligations for their analyses"
  on obligations for insert
  with check (
    exists (
      select 1 from analyses
      where analyses.id = obligations.analysis_id
      and analyses.user_id = auth.uid()
    )
  );

create policy "Users can delete obligations for their analyses"
  on obligations for delete
  using (
    exists (
      select 1 from analyses
      where analyses.id = obligations.analysis_id
      and analyses.user_id = auth.uid()
    )
  );

-- Benchmarks: Read-only for authenticated users
create policy "Authenticated users can read benchmarks"
  on benchmarks for select
  to authenticated
  using (true);

-- Clause Log: Insert-only by service role (no user read access)
-- (No select/update/delete policies for authenticated users; service role bypasses RLS)

