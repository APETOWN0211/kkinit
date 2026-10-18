-- =====================================================================
-- kkinit — Content CMS (Posts / Profiles / Tags / Images)
--
--  - Apply this in Supabase Dashboard → SQL Editor.
--  - Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS for policies).
--  - All RLS policies included.
--  - Public read / Admin auth write.
--
--  Spec: 50 requirements, 47 RLS, 28 Home feed query
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. set_updated_at trigger function (reusable)
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 2. profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  username     text unique not null,
  display_name text not null,
  avatar_path  text,
  bio          text,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Author profile (display name, avatar). Used by posts.author_id.';


-- ---------------------------------------------------------------------
-- 3. posts
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles(id) on delete cascade,
  content         text not null,
  like_count      integer not null default 0,
  comment_count   integer not null default 0,
  repost_count    integer not null default 0,
  is_following    boolean not null default true,
  location_name   text,
  restaurant_name text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_posts_created_at
  on public.posts (created_at desc);

create index if not exists idx_posts_author
  on public.posts (author_id);

drop trigger if exists trg_posts_set_updated_at on public.posts;
create trigger trg_posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 4. post_images
-- ---------------------------------------------------------------------
create table if not exists public.post_images (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  image_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_post_images_post
  on public.post_images (post_id, sort_order asc);


-- ---------------------------------------------------------------------
-- 5. post_tags
-- ---------------------------------------------------------------------
create table if not exists public.post_tags (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  label      text not null,
  variant    text not null check (variant in ('lime', 'orange', 'gray', 'teal')),
  sort_order integer not null default 0
);

create index if not exists idx_post_tags_post
  on public.post_tags (post_id, sort_order asc);


-- ---------------------------------------------------------------------
-- 6. admin_users (gates /admin/**)
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Whitelist of Supabase Auth user_ids allowed to access /admin/**.';


-- =====================================================================
-- 7. RLS — enable
-- =====================================================================
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.post_images enable row level security;
alter table public.post_tags   enable row level security;
alter table public.admin_users enable row level security;


-- =====================================================================
-- 8. RLS — public read
-- =====================================================================
drop policy if exists profiles_select_public    on public.profiles;
drop policy if exists posts_select_public       on public.posts;
drop policy if exists post_images_select_public on public.post_images;
drop policy if exists post_tags_select_public   on public.post_tags;

create policy profiles_select_public
  on public.profiles
  for select
  using (true);

create policy posts_select_public
  on public.posts
  for select
  using (true);

create policy post_images_select_public
  on public.post_images
  for select
  using (true);

create policy post_tags_select_public
  on public.post_tags
  for select
  using (true);


-- =====================================================================
-- 9. RLS — admin write (auth.uid() ∈ admin_users)
-- =====================================================================

-- helper: is the current auth user an admin?
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = uid
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

-- profiles
drop policy if exists profiles_insert_admin on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;
drop policy if exists profiles_delete_admin on public.profiles;

create policy profiles_insert_admin
  on public.profiles for insert
  with check (public.is_admin(auth.uid()));

create policy profiles_update_admin
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy profiles_delete_admin
  on public.profiles for delete
  using (public.is_admin(auth.uid()));

-- posts
drop policy if exists posts_insert_admin on public.posts;
drop policy if exists posts_update_admin on public.posts;
drop policy if exists posts_delete_admin on public.posts;

create policy posts_insert_admin
  on public.posts for insert
  with check (public.is_admin(auth.uid()));

create policy posts_update_admin
  on public.posts for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy posts_delete_admin
  on public.posts for delete
  using (public.is_admin(auth.uid()));

-- post_images
drop policy if exists post_images_insert_admin on public.post_images;
drop policy if exists post_images_update_admin on public.post_images;
drop policy if exists post_images_delete_admin on public.post_images;

create policy post_images_insert_admin
  on public.post_images for insert
  with check (public.is_admin(auth.uid()));

create policy post_images_update_admin
  on public.post_images for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy post_images_delete_admin
  on public.post_images for delete
  using (public.is_admin(auth.uid()));

-- post_tags
drop policy if exists post_tags_insert_admin on public.post_tags;
drop policy if exists post_tags_update_admin on public.post_tags;
drop policy if exists post_tags_delete_admin on public.post_tags;

create policy post_tags_insert_admin
  on public.post_tags for insert
  with check (public.is_admin(auth.uid()));

create policy post_tags_update_admin
  on public.post_tags for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy post_tags_delete_admin
  on public.post_tags for delete
  using (public.is_admin(auth.uid()));

-- admin_users: only admins can see/manage the whitelist.
drop policy if exists admin_users_select_admin on public.admin_users;
drop policy if exists admin_users_insert_admin on public.admin_users;
drop policy if exists admin_users_delete_admin on public.admin_users;

create policy admin_users_select_admin
  on public.admin_users for select
  using (public.is_admin(auth.uid()));

create policy admin_users_insert_admin
  on public.admin_users for insert
  with check (public.is_admin(auth.uid()));

create policy admin_users_delete_admin
  on public.admin_users for delete
  using (public.is_admin(auth.uid()));


-- =====================================================================
-- 10. Storage policies
--     Bucket 'kkinit-images' is public for read.
--     Admin auth user can write/delete in feed/ and chat/ folders
--     (profiles/ and archive/ are managed elsewhere — keep writable
--      for completeness, but admin CMS only writes to feed/ + chat/).
-- =====================================================================

-- The bucket is created/owned by Dashboard, but we can ensure it's public.
insert into storage.buckets (id, name, public)
values ('kkinit-images', 'kkinit-images', true)
on conflict (id) do update set public = excluded.public;

-- Drop old policies (idempotent)
drop policy if exists "Public read kkinit-images"   on storage.objects;
drop policy if exists "Admin write kkinit-images"   on storage.objects;
drop policy if exists "Admin delete kkinit-images"  on storage.objects;

-- Public read for all objects in this bucket
create policy "Public read kkinit-images"
  on storage.objects
  for select
  using (bucket_id = 'kkinit-images');

-- Admin write (insert/update) — any path inside this bucket
create policy "Admin write kkinit-images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'kkinit-images'
    and public.is_admin(auth.uid())
  );

create policy "Admin update kkinit-images"
  on storage.objects
  for update
  using (
    bucket_id = 'kkinit-images'
    and public.is_admin(auth.uid())
  )
  with check (
    bucket_id = 'kkinit-images'
    and public.is_admin(auth.uid())
  );

create policy "Admin delete kkinit-images"
  on storage.objects
  for delete
  using (
    bucket_id = 'kkinit-images'
    and public.is_admin(auth.uid())
  );


-- =====================================================================
-- 11. Seed: profiles (matches current mock authors)
--     Use ON CONFLICT DO NOTHING so re-running is safe.
--     Storage paths point to existing chat/ + feed/ files in
--     kkinit-images bucket.
-- =====================================================================
insert into public.profiles (id, username, display_name, avatar_path) values
  ('11111111-1111-1111-1111-111111111111', 'kurumi',  '쿠루미',   'chat/profile-kurumi.png'),
  ('22222222-2222-2222-2222-222222222222', 'tiranori','티라노리', 'chat/profile-tiranori.png'),
  ('33333333-3333-3333-3333-333333333333', 'johnny',  '죠니월드', 'chat/profile-johnny.png'),
  ('44444444-4444-4444-4444-444444444444', 'dogidog', '도기독',   'chat/profile-johnny-muted.png')
on conflict (username) do nothing;


-- =====================================================================
-- 12. Seed: posts (current Home mock data)
-- =====================================================================
do $$
declare
  v_kurumi   uuid := '11111111-1111-1111-1111-111111111111';
  v_tiranori uuid := '22222222-2222-2222-2222-222222222222';
  v_johnny   uuid := '33333333-3333-3333-3333-333333333333';
  v_post1    uuid;
  v_post2    uuid;
  v_post3    uuid;
begin
  if not exists (select 1 from public.posts) then
    -- post 1
    v_post1 := gen_random_uuid();
    insert into public.posts (id, author_id, content, like_count, comment_count, repost_count, is_following, created_at)
    values (v_post1, v_kurumi,
            E'우리 동네 유명한 삼겹살 집인데\n저녁에는 웨이팅 30분 정도 걸림..',
            149, 2, 2, false, now() - interval '1 minute');

    insert into public.post_tags (post_id, label, variant, sort_order) values
      (v_post1, '삼겹살', 'orange', 0),
      (v_post1, '웨이팅', 'teal',   1);

    insert into public.post_images (post_id, image_path, sort_order) values
      (v_post1, 'feed/kurumi-samgyeopsal.png', 0),
      (v_post1, 'feed/kurumi-storefront.png',   1);

    -- post 2
    v_post2 := gen_random_uuid();
    insert into public.posts (id, author_id, content, like_count, comment_count, repost_count, is_following, created_at)
    values (v_post2, v_tiranori,
            E'유명한 빵집 줄 서기 싫어서 들어갔는데\n오히려 여기가 좋았음.\n소금빵 은 포장하고 바로드셈',
            14, 2, 2, false, now() - interval '2 hours');

    insert into public.post_tags (post_id, label, variant, sort_order) values
      (v_post2, '소금빵', 'orange', 0);

    insert into public.post_images (post_id, image_path, sort_order) values
      (v_post2, 'feed/tiranori-bakery.png', 0);

    -- post 3
    v_post3 := gen_random_uuid();
    insert into public.posts (id, author_id, content, like_count, comment_count, repost_count, is_following, created_at)
    values (v_post3, v_kurumi,
            E'우리 동네 유명한 삼겹살 집인데\n저녁에는 웨이팅 30분 정도 걸림..',
            149, 2, 2, false, now() - interval '1 minute');

    insert into public.post_tags (post_id, label, variant, sort_order) values
      (v_post3, '삼겹살', 'orange', 0),
      (v_post3, '웨이팅', 'teal',   1);

    insert into public.post_images (post_id, image_path, sort_order) values
      (v_post3, 'feed/kurumi-samgyeopsal-alt.png', 0);
  end if;
end $$;
