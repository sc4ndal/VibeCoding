-- PRD_step3: 사용자 프로필 & 레시피 저장
-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용을 그대로 실행하세요.

-- 1. profiles 테이블
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '사용자',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. 회원가입 시 profiles 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. saved_recipes 테이블
create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  used_ingredients jsonb not null default '[]'::jsonb,
  extra_ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  estimated_time_minutes integer,
  difficulty smallint check (difficulty between 1 and 5),
  source_image_url text,
  created_at timestamptz not null default now()
);

-- 기존에 테이블을 이미 만든 경우를 위한 마이그레이션 (신규 설치에도 안전하게 재실행 가능)
alter table public.saved_recipes add column if not exists difficulty smallint check (difficulty between 1 and 5);

alter table public.saved_recipes enable row level security;

drop policy if exists "Users can view own recipes" on public.saved_recipes;
create policy "Users can view own recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own recipes" on public.saved_recipes;
create policy "Users can insert own recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own recipes" on public.saved_recipes;
create policy "Users can delete own recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);
