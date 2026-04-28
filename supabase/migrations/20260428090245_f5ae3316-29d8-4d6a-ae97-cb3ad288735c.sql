
-- ROOMS
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null,
  scenario_id text not null,
  status text not null default 'waiting',
  min_players int not null default 4,
  max_players int not null default 8,
  run_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists rooms_host_idx on public.rooms(host_user_id);

alter table public.rooms enable row level security;

drop policy if exists "rooms host all" on public.rooms;
create policy "rooms host all" on public.rooms
  for all using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);

drop policy if exists "rooms public read by code" on public.rooms;
create policy "rooms public read by code" on public.rooms
  for select using (true);

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at before update on public.rooms
  for each row execute function public.set_updated_at();

-- ROOM PLAYERS
create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid,
  display_name text not null,
  is_host boolean not null default false,
  ready boolean not null default false,
  joined_at timestamptz not null default now()
);

create index if not exists room_players_room_idx on public.room_players(room_id);

alter table public.room_players enable row level security;

drop policy if exists "room_players read all" on public.room_players;
create policy "room_players read all" on public.room_players
  for select using (true);

drop policy if exists "room_players self insert" on public.room_players;
create policy "room_players self insert" on public.room_players
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists "room_players self update" on public.room_players;
create policy "room_players self update" on public.room_players
  for update using (auth.uid() = user_id);

drop policy if exists "room_players self or host delete" on public.room_players;
create policy "room_players self or host delete" on public.room_players
  for delete using (
    auth.uid() = user_id
    or exists (select 1 from public.rooms r where r.id = room_id and r.host_user_id = auth.uid())
  );

-- REALTIME
alter table public.rooms replica identity full;
alter table public.room_players replica identity full;

do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.rooms';
  exception when duplicate_object then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.room_players';
  exception when duplicate_object then null;
  end;
end $$;
