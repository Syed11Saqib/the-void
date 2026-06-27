-- Run this in Supabase SQL editor (Project -> SQL Editor -> New query).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age int not null check (age >= 0 and age <= 130),
  gender text not null,
  height_cm numeric not null,
  weight_kg numeric not null,
  diabetes boolean not null default false,
  blood_pressure boolean not null default false,
  asthma boolean not null default false,
  smoking boolean not null default false,
  alcohol boolean not null default false,
  lifestyle text,
  allergies text[] not null default '{}',
  other_diseases text[] not null default '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  avatar_color text not null default '#1FB088',
  avatar_emoji text not null default '🙂',
  is_temporary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.symptom_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  transcript jsonb not null default '[]',
  urgency text,
  summary jsonb,
  emergency_triggered boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.symptom_sessions enable row level security;

create policy "Users manage their own profiles"
  on public.profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own sessions"
  on public.symptom_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists sessions_profile_id_idx on public.symptom_sessions(profile_id);
