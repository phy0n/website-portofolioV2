-- Analytics events table and policies
begin;

create table if not exists public.analytics_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  visitor_id text not null,
  ip_hash text null,
  path text not null,
  referrer text null,
  user_agent text null
);

alter table public.analytics_events
  add column if not exists ip_hash text null;

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at);
create index if not exists analytics_events_visitor_id_idx
  on public.analytics_events (visitor_id);
create index if not exists analytics_events_ip_hash_idx
  on public.analytics_events (ip_hash);
create index if not exists analytics_events_path_idx
  on public.analytics_events (path);

alter table public.analytics_events enable row level security;

drop policy if exists "analytics_insert" on public.analytics_events;
drop policy if exists "analytics_select_admins" on public.analytics_events;

create policy "analytics_insert" on public.analytics_events
  for insert
  with check (true);

create policy "analytics_select_admins" on public.analytics_events
  for select
  using (exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ));

commit;
