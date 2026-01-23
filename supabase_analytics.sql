-- Analytics events table and policies
begin;

create table if not exists public.analytics_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  visitor_id text not null,
  path text not null,
  referrer text null,
  user_agent text null
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at);
create index if not exists analytics_events_visitor_id_idx
  on public.analytics_events (visitor_id);
create index if not exists analytics_events_path_idx
  on public.analytics_events (path);

alter table public.analytics_events enable row level security;

create policy "analytics_insert" on public.analytics_events
  for insert
  with check (true);

create policy "analytics_select_admins" on public.analytics_events
  for select
  using (exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ));

commit;
