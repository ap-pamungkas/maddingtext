-- ==========================================================
-- SKRIP SETUP SUPABASE UNTUK MADDINGTEXT
-- Salin dan jalankan seluruh isi file ini di:
-- Supabase Dashboard > SQL Editor > New query > Run
-- ==========================================================

-- 1. Buat tabel notes
create table if not exists public.notes (
  id text primary key,
  text text not null default '',
  x numeric not null default 100,
  y numeric not null default 100,
  z_index integer not null default 1,
  pinned boolean not null default false,
  paper_color text not null default '#FFE27A',
  text_color text,
  pattern text not null default 'polos',
  font text not null default 'sans',
  shape text not null default 'standar',
  rotation numeric not null default 0,
  pin_x numeric default 50,
  pin_y numeric default 12,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Aktifkan Row Level Security (RLS)
alter table public.notes enable row level security;

-- 3. Kebijakan akses publik (agar semua siswa dapat melihat dan menulis di mading)
drop policy if exists "Semua orang bisa membaca catatan" on public.notes;
create policy "Semua orang bisa membaca catatan" 
  on public.notes for select 
  using (true);

drop policy if exists "Semua orang bisa membuat catatan" on public.notes;
create policy "Semua orang bisa membuat catatan" 
  on public.notes for insert 
  with check (true);

drop policy if exists "Semua orang bisa mengedit catatan" on public.notes;
create policy "Semua orang bisa mengedit catatan" 
  on public.notes for update 
  using (true);

drop policy if exists "Semua orang bisa menghapus catatan" on public.notes;
create policy "Semua orang bisa menghapus catatan" 
  on public.notes for delete 
  using (true);

-- 4. Aktifkan fitur Realtime Supabase untuk tabel notes
-- Catatan: Jika perintah ini menghasilkan error "already exists", abaikan saja.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table public.notes;
  end if;
end $$;

