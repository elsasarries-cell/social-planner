-- Ejecutá esto en el SQL Editor de Supabase

-- Tabla de clientes
create table clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  rubro text not null,
  instagram text not null,
  color text default '#7C5CFC',
  created_at timestamp with time zone default now()
);

-- Tabla de posts
create table posts (
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

-- Habilitar realtime para updates en vivo
alter publication supabase_realtime add table posts;

-- Política de acceso público (para links de cliente sin login)
alter table clients enable row level security;
alter table posts enable row level security;

create policy "Public read clients" on clients for select using (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public update posts" on posts for update using (true);
create policy "Public insert posts" on posts for insert with check (true);

-- Datos de ejemplo (3 clientes)
insert into clients (name, rubro, instagram, color) values
  ('Alma Café', 'Gastronomía', '@almacafe', '#FF6B6B'),
  ('Studio Mov', 'Fitness & Wellness', '@studiomov', '#4ECDC4'),
  ('Arkana Design', 'Arquitectura', '@arkanadesign', '#7C5CFC');
