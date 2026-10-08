create extension if not exists pgcrypto with schema extensions;

create table if not exists public.ida_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ida_sessions (
  token_hash text primary key,
  account_id uuid not null references public.ida_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

create table if not exists public.ida_account_state (
  account_id uuid primary key references public.ida_accounts(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ida_accounts enable row level security;
alter table public.ida_sessions enable row level security;
alter table public.ida_account_state enable row level security;

revoke all on public.ida_accounts from anon, authenticated;
revoke all on public.ida_sessions from anon, authenticated;
revoke all on public.ida_account_state from anon, authenticated;

create or replace function public.ida_create_account(p_name text, p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare normalized text := lower(btrim(p_name)); new_id uuid; token text;
begin
  if char_length(normalized) < 2 or char_length(normalized) > 40 then raise exception 'Name must be between 2 and 40 characters.'; end if;
  if char_length(p_password) < 8 then raise exception 'Use a password with at least 8 characters.'; end if;
  if exists (select 1 from public.ida_accounts a where a.name_key = normalized) then raise exception 'That IDA name is already taken. Choose another name.'; end if;
  insert into public.ida_accounts(name,name_key,password_hash) values (btrim(p_name),normalized,extensions.crypt(p_password,extensions.gen_salt('bf',12))) returning id into new_id;
  token := encode(extensions.gen_random_bytes(32),'hex');
  insert into public.ida_sessions(token_hash,account_id) values (encode(extensions.digest(token,'sha256'),'hex'),new_id);
  insert into public.ida_account_state(account_id,state) values (new_id,'{}'::jsonb);
  return jsonb_build_object('account_id',new_id,'display_name',btrim(p_name),'session_token',token);
end $$;

create or replace function public.ida_sign_in(p_name text,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare normalized text := lower(btrim(p_name)); account public.ida_accounts%rowtype; token text;
begin
  select * into account from public.ida_accounts where name_key=normalized;
  if not found or account.password_hash <> extensions.crypt(p_password,account.password_hash) then raise exception 'Incorrect IDA name or password.'; end if;
  token := encode(extensions.gen_random_bytes(32),'hex');
  insert into public.ida_sessions(token_hash,account_id) values (encode(extensions.digest(token,'sha256'),'hex'),account.id);
  return jsonb_build_object('account_id',account.id,'display_name',account.name,'session_token',token);
end $$;

create or replace function public.ida_load_state(p_account_id uuid,p_session_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare valid boolean; result jsonb;
begin
  select exists(select 1 from public.ida_sessions s where s.account_id=p_account_id and s.token_hash=encode(extensions.digest(p_session_token,'sha256'),'hex') and s.expires_at>now()) into valid;
  if not valid then raise exception 'IDA session expired. Please sign in again.'; end if;
  update public.ida_sessions set last_seen_at=now(),expires_at=now()+interval '90 days' where token_hash=encode(extensions.digest(p_session_token,'sha256'),'hex');
  select coalesce(s.state,'{}'::jsonb) into result from public.ida_account_state s where s.account_id=p_account_id;
  return coalesce(result,'{}'::jsonb);
end $$;

create or replace function public.ida_save_state(p_account_id uuid,p_session_token text,p_state jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare valid boolean;
begin
  select exists(select 1 from public.ida_sessions s where s.account_id=p_account_id and s.token_hash=encode(extensions.digest(p_session_token,'sha256'),'hex') and s.expires_at>now()) into valid;
  if not valid then raise exception 'IDA session expired. Please sign in again.'; end if;
  update public.ida_sessions set last_seen_at=now(),expires_at=now()+interval '90 days' where token_hash=encode(extensions.digest(p_session_token,'sha256'),'hex');
  insert into public.ida_account_state(account_id,state,updated_at) values(p_account_id,coalesce(p_state,'{}'::jsonb),now())
  on conflict(account_id) do update set state=excluded.state,updated_at=excluded.updated_at;
  return true;
end $$;

create or replace function public.ida_sign_out(p_account_id uuid,p_session_token text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  delete from public.ida_sessions where account_id=p_account_id and token_hash=encode(extensions.digest(p_session_token,'sha256'),'hex');
  return true;
end $$;

revoke execute on function public.ida_create_account(text,text) from public;
revoke execute on function public.ida_sign_in(text,text) from public;
revoke execute on function public.ida_load_state(uuid,text) from public;
revoke execute on function public.ida_save_state(uuid,text,jsonb) from public;
revoke execute on function public.ida_sign_out(uuid,text) from public;
grant execute on function public.ida_create_account(text,text) to anon;
grant execute on function public.ida_sign_in(text,text) to anon;
grant execute on function public.ida_load_state(uuid,text) to anon;
grant execute on function public.ida_save_state(uuid,text,jsonb) to anon;
grant execute on function public.ida_sign_out(uuid,text) to anon;