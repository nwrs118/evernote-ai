create table public.notebooks_partages (
  id text primary key,
  title text,
  data jsonb not null,
  created_at timestamptz default now()
);

alter table public.notebooks_partages enable row level security;

create policy "Lecture publique"
  on public.notebooks_partages for select
  using (true);

create policy "Insertion publique"
  on public.notebooks_partages for insert
  with check (true);