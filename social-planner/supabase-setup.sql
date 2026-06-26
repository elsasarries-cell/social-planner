-- Ejecutá esto en el SQL Editor de Supabase

-- Agregar campo idea visual a los posts
alter table posts add column if not exists visual_idea text default '';

-- Asegurarse que productos esté en clients
alter table clients add column if not exists productos text default '[]';

-- Política para eliminar posts
drop policy if exists "Public delete posts" on posts;
create policy "Public delete posts" on posts for delete using (true);

-- Realtime para clients
alter publication supabase_realtime add table clients;
