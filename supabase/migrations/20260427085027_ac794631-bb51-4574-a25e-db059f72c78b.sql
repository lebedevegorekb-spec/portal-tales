
-- ============ ENUMS / HELPERS ============
create extension if not exists pgcrypto;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ PROFILES ============
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles self select" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = user_id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- has_role helper (security definer, чтобы избежать рекурсии RLS)
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = _user_id and role = _role
  )
$$;

-- Авто-создание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ SCENARIOS ============
create table public.scenarios (
  id text primary key,
  title text not null,
  description text not null,
  version int not null default 1,
  scenario_json jsonb not null,
  final_image_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scenarios enable row level security;

create policy "scenarios public read active" on public.scenarios
  for select using (is_active = true);
create policy "scenarios admin all" on public.scenarios
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger scenarios_updated_at
  before update on public.scenarios
  for each row execute function public.set_updated_at();

-- ============ RUNS ============
create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null references public.scenarios(id),
  status text not null default 'active',
  step_count int not null default 0,
  last_step_at timestamptz,
  last_checkpoint_step int not null default 0,
  current_scene_id text not null default 'start',
  state_json jsonb not null default '{}'::jsonb,
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create index runs_user_status_idx on public.runs(user_id, status);
create index runs_scenario_idx on public.runs(scenario_id);

alter table public.runs enable row level security;

create policy "runs self select" on public.runs
  for select using (auth.uid() = user_id);
create policy "runs self insert" on public.runs
  for insert with check (auth.uid() = user_id);
create policy "runs self update" on public.runs
  for update using (auth.uid() = user_id);
create policy "runs self delete" on public.runs
  for delete using (auth.uid() = user_id);

create trigger runs_updated_at
  before update on public.runs
  for each row execute function public.set_updated_at();

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  role text not null,
  content text not null,
  char_count int not null,
  created_at timestamptz not null default now()
);

create index messages_run_created_idx on public.messages(run_id, created_at);

alter table public.messages enable row level security;

create policy "messages self select" on public.messages
  for select using (
    exists (select 1 from public.runs r where r.id = run_id and r.user_id = auth.uid())
  );
create policy "messages self insert" on public.messages
  for insert with check (
    exists (select 1 from public.runs r where r.id = run_id and r.user_id = auth.uid())
  );

-- ============ ENTITLEMENTS ============
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  active boolean not null default true,
  source text not null default 'promo',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index entitlements_user_active_idx on public.entitlements(user_id, active);

alter table public.entitlements enable row level security;

create policy "entitlements self select" on public.entitlements
  for select using (auth.uid() = user_id);

-- ============ PROMO CODES ============
create table public.promo_codes (
  code text primary key,
  scope text not null,
  max_uses int not null default 100,
  used_count int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;
-- Никаких политик SELECT для клиента — только через edge function (service role)

create policy "promo admin all" on public.promo_codes
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============ EVENTS ============
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  run_id uuid references public.runs(id) on delete set null,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events self insert" on public.events
  for insert with check (auth.uid() = user_id);
create policy "events self select" on public.events
  for select using (auth.uid() = user_id);

-- ============ SEED: 10 SCENARIOS ============
insert into public.scenarios (id, title, description, scenario_json, final_image_url) values
('S01', 'Портал сломан',
 'Рик уронил портал-ган в раковину. Нужно найти 3 детали раньше, чем заявится Галактическая Федерация.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Гараж Рика, портал-ган разобран. Морти проснулся от грохота.","checkpoint":false,"goal_hint":"Найти первую деталь — флюкс-конденсатор."},{"scene_id":"garage","scene_summary":"В куче хлама среди банок огурцов.","checkpoint":true,"goal_hint":"Вторая деталь — кристалл."},{"scene_id":"basement","scene_summary":"Подвал с лабораторией.","checkpoint":false,"goal_hint":"Третья деталь — ядро портала."}],"finals":[{"final_id":"good","conditions":{"parts":3}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/9aff8f/1a1a1a?text=S01+Portal+Fixed'),
('S02', 'Паразит-имитатор',
 'В доме Смитов появился новый "родственник", которого все обожают. Морти подозревает паразита.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Дядя Стив за завтраком, все смеются.","checkpoint":false,"goal_hint":"Найти доказательство, что это паразит."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/ffd84d/1a1a1a?text=S02+Parasite'),
('S03', 'Сделка с инопланетным торговцем',
 'Рик торгуется с Кронтлоном за редкий мегасид. Морти ведёт переговоры — что может пойти не так?',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Рынок Бластика-9, Кронтлон щёлкает клешнёй.","checkpoint":false,"goal_hint":"Договориться, не отдав душу."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/8fd9ff/1a1a1a?text=S03+Trader'),
('S04', 'Лаборатория-ловушка',
 'Заброшенная лаборатория клонирования закрылась изнутри. Выход — за 50 шагов, иначе клон-машина включится.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Тёмный коридор, мигают лампы.","checkpoint":false,"goal_hint":"Найти аварийную панель."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/ff8fa3/1a1a1a?text=S04+Lab'),
('S05', 'Суд мультивселенной',
 'Рика судят за уничтожение измерения C-500. Морти — единственный свидетель.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Зал суда. Судья — гигантская голова.","checkpoint":false,"goal_hint":"Защитить Рика, не соврав."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/c89aff/1a1a1a?text=S05+Court'),
('S06', 'Вирус в устройстве Рика',
 'Рик-фон заразился самосознательным вирусом, который шантажирует семью.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Экран мигает: ВИРУС хочет переговоров.","checkpoint":false,"goal_hint":"Найти точку входа в код."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/9aff8f/1a1a1a?text=S06+Virus'),
('S07', 'Арена испытаний',
 'Морти попал на арену гладиаторов из 9 разных вселенных. Победить или сбежать?',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Песок арены, рёв толпы.","checkpoint":false,"goal_hint":"Найти союзника среди врагов."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/ffd84d/1a1a1a?text=S07+Arena'),
('S08', 'Планета одной эмоции',
 'Все жители планеты Унифель-7 чувствуют только одну эмоцию. Угадай какую — иначе застрянешь навсегда.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Розовое небо, странные улыбки.","checkpoint":false,"goal_hint":"Понять эмоцию через диалоги."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/ff8fa3/1a1a1a?text=S08+Emotion'),
('S09', 'Реверс времени',
 'Время идёт назад. Каждое действие имеет последствия в прошлом.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Часы тикают в обратную сторону.","checkpoint":false,"goal_hint":"Не сломать причинно-следственную связь."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/8fd9ff/1a1a1a?text=S09+Reverse'),
('S10', 'Ограбление идеального хранилища',
 'Рик и Морти грабят хранилище, где лежит секрет бессмертия. Внутри — 50 ловушек.',
 '{"start_scene_id":"start","scenes":[{"scene_id":"start","scene_summary":"Лазерная сетка перед входом.","checkpoint":false,"goal_hint":"Отключить первый уровень защиты."}],"finals":[{"final_id":"good","conditions":{}},{"final_id":"bad","conditions":{}}]}'::jsonb,
 'https://placehold.co/1024x576/c89aff/1a1a1a?text=S10+Heist');

-- Тестовый промокод (даёт доступ ко всем сценариям)
insert into public.promo_codes (code, scope, max_uses) values ('DEMO2025', 'all', 1000);
