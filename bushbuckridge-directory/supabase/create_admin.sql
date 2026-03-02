-- Execute this script in your Supabase SQL Editor
-- This script will create a user with the email admin@rimintsu.co.za and password 12345678,
-- and automatically assign it as an admin.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Insert into auth.users (Supabase Authentication table)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@rimintsu.co.za',
    crypt('12345678', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 2. Insert into auth.identities (Required for Supabase Auth to track the sign-in provider)
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'admin@rimintsu.co.za',
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id::text, 'admin@rimintsu.co.za')::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  -- 3. Insert into public.admins (Our custom table)
  INSERT INTO public.admins (id) VALUES (new_user_id);

END $$;
