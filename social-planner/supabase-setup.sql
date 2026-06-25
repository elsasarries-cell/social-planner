-- Ejecutá esto en el SQL Editor de Supabase
-- Si ya tenés las tablas de antes, ejecutá solo la parte de ALTER TABLE

-- ── Si es la primera vez (tablas nuevas) ─────────────────────────────────────

create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  rubro text not null,
  instagram text not null,
  color text default '#7C5CFC',
  tono text default '',
  objetivo text default '',
  audiencia text default '',
  competencia text default '',
  hashtags text default '',
  referencias text default '',
  formatos_preferidos text default '',
  frecuencia text default '3',
  notas text default '',
  created_at timestamp with time zone default now()
);

create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  day integer not null,
  month integer not null,
  year integer not null,
  format text not null check (format in ('reel','carrusel','historia','imagen')),
  hook text not null,
  copy text not null,
  cta text not null,
  status text not null default 'pending' check (status in ('pending','content_approved','design_review','fully_approved','changes_requested')),
  design_url text default '',
  comment text default '',
  design_comment text default '',
  created_at timestamp with time zone default now()
);

-- ── Si ya tenías las tablas, agregá solo las columnas nuevas ─────────────────
-- (podés ejecutar esto de todas formas, falla silenciosamente si ya existen)

alter table clients add column if not exists tono text default '';
alter table clients add column if not exists objetivo text default '';
alter table clients add column if not exists audiencia text default '';
alter table clients add column if not exists competencia text default '';
alter table clients add column if not exists hashtags text default '';
alter table clients add column if not exists referencias text default '';
alter table clients add column if not exists formatos_preferidos text default '';
alter table clients add column if not exists frecuencia text default '3';
alter table clients add column if not exists notas text default '';

-- ── Realtime ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table posts;

-- ── Políticas de acceso público ───────────────────────────────────────────────
alter table clients enable row level security;
alter table posts enable row level security;

drop policy if exists "Public read clients" on clients;
drop policy if exists "Public read posts" on posts;
drop policy if exists "Public update posts" on posts;
drop policy if exists "Public insert posts" on posts;
drop policy if exists "Public update clients" on clients;
drop policy if exists "Public insert clients" on clients;

create policy "Public read clients" on clients for select using (true);
create policy "Public update clients" on clients for update using (true);
create policy "Public insert clients" on clients for insert with check (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public update posts" on posts for update using (true);
create policy "Public insert posts" on posts for insert with check (true);
