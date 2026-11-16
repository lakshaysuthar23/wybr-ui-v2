-- Wybr database, phase 1: profiles. Run this once in Supabase: SQL Editor > New query > paste > Run.
-- Security model: the browser only holds the public anon key, so every rule lives here in the database.

create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  first_name      text not null check (char_length(btrim(first_name)) between 1 and 20),
  gender          text not null check (gender in ('man', 'woman')),
  energy          smallint not null default 50 check (energy between 0 and 100),
  trust_level     smallint not null default 0 check (trust_level between 0 and 2),
  selfie_verified boolean not null default false,
  status          text not null default 'pending' check (status in ('pending', 'active', 'banned')),
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- Row rules: a signed-in user can only ever see or change their own row.
drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Column rules: users can never set trust_level, selfie_verified or status. Only the server can.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, first_name, gender, energy) on public.profiles to authenticated;
grant update (first_name, energy) on public.profiles to authenticated;

-- Right to erasure (DPDP): the signed-in user can delete their own account and all linked data.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
