-- =====================================================================
-- kkinit — Admin user mapping (use AFTER manual auth user creation)
--
-- Step 1:  Supabase Dashboard → Authentication → Users → "Add user"
--          → choose "Create new user" → email + password.
--          → Uncheck "Auto Confirm User" OFF; check ON.
--          → After save, copy the new user's UUID.
--
-- Step 2:  Paste the UUID into `admin_user_id` below, then Run this
--          script in Supabase SQL Editor.
-- =====================================================================

do $$
declare
  admin_user_id uuid := '<PASTE-USER-UUID-HERE>';
begin
  insert into public.admin_users (user_id)
  values (admin_user_id)
  on conflict (user_id) do nothing;

  raise notice 'Registered % as admin', admin_user_id;
end
$$;

-- Verify
select u.id, u.email, u.email_confirmed_at
from auth.users u
join public.admin_users a on a.user_id = u.id;
