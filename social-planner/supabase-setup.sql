-- Ejecutá esto en el SQL Editor de Supabase

-- Agregar estado published a posts
alter table posts drop constraint if exists posts_status_check;
alter table posts add constraint posts_status_check 
  check (status in ('pending','content_approved','design_review','fully_approved','changes_requested','published'));

-- Agregar columnas de diseño
alter table posts add column if not exists design_folder_url text default '';
alter table posts add column if not exists visual_idea text default '';

-- Agregar todas las columnas del perfil de cliente
alter table clients add column if not exists tono text default '';
alter table clients add column if not exists objetivo text default '';
alter table clients add column if not exists audiencia text default '';
alter table clients add column if not exists competencia text default '';
alter table clients add column if not exists hashtags text default '';
alter table clients add column if not exists referencias text default '';
alter table clients add column if not exists formatos_preferidos text default '';
alter table clients add column if not exists frecuencia text default '3';
alter table clients add column if not exists notas text default '';
alter table clients add column if not exists productos text default '[]';

-- Políticas completas
alter table clients enable row level security;
alter table posts enable row level security;

drop policy if exists "Public read clients" on clients;
drop policy if exists "Public update clients" on clients;
drop policy if exists "Public insert clients" on clients;
drop policy if exists "Public read posts" on posts;
drop policy if exists "Public update posts" on posts;
drop policy if exists "Public insert posts" on posts;
drop policy if exists "Public delete posts" on posts;

create policy "Public read clients" on clients for select using (true);
create policy "Public update clients" on clients for update using (true);
create policy "Public insert clients" on clients for insert with check (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public update posts" on posts for update using (true);
create policy "Public insert posts" on posts for insert with check (true);
create policy "Public delete posts" on posts for delete using (true);
