-- =====================================================================
-- kkinit — Admin user bootstrap
-- Apply in Supabase Dashboard → SQL Editor (one-time).
--
-- Creates a single admin account and registers it in admin_users.
-- Edit `admin_email` / `admin_password` below before running if you
-- want different credentials.
-- =====================================================================

do $$
declare
  admin_email    text := 'admin@kkinit.app';
  admin_password text := 'kkinit-admin-2026!';
  new_user_id    uuid;
begin
  -- 1) Create auth user (admin) if it doesn't already exist.
  --    crypt() with bcrypt generates the password hash Supabase expects.
  select id into new_user_id
  from auth.users
  where email = admin_email;

  if new_user_id is null then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    returning id into new_user_id;
  end if;

  -- 2) Register in admin_users so middleware allows the route.
  insert into public.admin_users (user_id)
  values (new_user_id)
  on conflict (user_id) do nothing;

  -- 3) Also create an identity row (required for newer Supabase versions).
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', admin_email, 'email_verified', true),
    'email',
    admin_email,
    now(),
    now(),
    now()
  where not exists (
    select 1 from auth.identities where user_id = new_user_id
  );

  raise notice 'Admin ready: % (id=%)', admin_email, new_user_id;
end
$$;
