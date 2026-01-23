# Supabase Admin Dashboard Setup

Dokumen ini menjelaskan cara mengaktifkan dashboard admin untuk mengelola blog dan quotes.

## 1) Install dependency

Pilih salah satu:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

```bash
bun add @supabase/supabase-js @supabase/ssr
```

## 2) Buat project Supabase

- Buat project baru di Supabase.
- Catat `Project URL` dan `anon public key`.

## 3) Buat tabel + RLS

Jalankan SQL berikut di Supabase SQL Editor:

```sql
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  author text not null,
  date date not null,
  category text not null,
  tags text[] not null default '{}',
  image text,
  featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  text text not null,
  author text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.blogs enable row level security;
alter table public.quotes enable row level security;

create policy "Public read published blogs"
  on public.blogs for select
  using (is_published = true);

create policy "Admin write blogs"
  on public.blogs for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Public read quotes"
  on public.quotes for select
  using (true);

create policy "Admin write quotes"
  on public.quotes for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admin read own admin row"
  on public.admin_users for select
  using (user_id = auth.uid());
```

Optional (lebih aman): buat trigger untuk update `updated_at` otomatis.

## 4) Buat akun admin

1. Buat user di Supabase Auth (email + password).
2. Ambil `user_id` dari tabel `auth.users`.
3. Insert ke `admin_users`:

```sql
insert into public.admin_users (user_id)
values ('YOUR_USER_UUID');
```

## 5) Set environment variables

Tambahkan ke `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 6) Migrasi data lama (opsional)

- Blog lama ada di `src/data/blogs.json`.
- Quotes lama ada di `src/data/quotes/daily.json`.

Cara cepat:
- Export JSON ke CSV.
- Import lewat Supabase Table Editor.

## 7) Jalankan app

```bash
npm run dev
```

Buka `http://localhost:3000/admin/login` untuk login.

## Security checklist

- Nonaktifkan public signups (Auth -> Settings) atau aktifkan allowlist email.
- Gunakan password kuat dan aktifkan MFA jika tersedia.
- Jangan pernah expose service role key di client.
- Pastikan RLS aktif dan policy sudah sesuai.
- Rotasi key jika pernah bocor.
