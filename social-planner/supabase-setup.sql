-- Ejecutá esto en el SQL Editor de Supabase

-- Agregar columna para link de carpeta de diseño
alter table posts add column if not exists design_folder_url text default '';

-- Agregar visual_idea si no existe todavía
alter table posts add column if not exists visual_idea text default '';

-- Agregar productos a clients si no existe
alter table clients add column if not exists productos text default '[]';

-- Política para eliminar posts
drop policy if exists "Public delete posts" on posts;
create policy "Public delete posts" on posts for delete using (true);
