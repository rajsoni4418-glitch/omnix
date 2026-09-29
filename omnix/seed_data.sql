-- Unified Seed File for Omnix Production Database
-- Created to be 100% compliant with the existing database schema.
-- Contains ONLY INSERT/UPDATE statements. No table modifications.

-- 1. USERS & FOLLOWERS

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('8fb7f5ae-b1d5-4ee7-8652-b757393173a5', '00000000-0000-0000-0000-000000000000', 'emma_w@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Emma Wilson"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'emma_w', 'emma_w@example.com', 'Emma Wilson', 'Photography & Travel 📸✈️', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", "location": "New York, USA"}'::jsonb WHERE id = '8fb7f5ae-b1d5-4ee7-8652-b757393173a5';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('84ad35bc-5be1-42b1-947a-e073538fd82d', '00000000-0000-0000-0000-000000000000', 'jcarter@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"James Carter"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('84ad35bc-5be1-42b1-947a-e073538fd82d', 'jcarter', 'jcarter@example.com', 'James Carter', 'Tech enthusiast. Coffee addict. ☕️', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1517430816045-df4b7ef11df1?w=800&q=80", "location": "San Francisco, CA"}'::jsonb WHERE id = '84ad35bc-5be1-42b1-947a-e073538fd82d';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('29209b5b-6a45-4650-aac7-50d6e2566c5e', '00000000-0000-0000-0000-000000000000', 'sophia_l@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sophia Lee"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('29209b5b-6a45-4650-aac7-50d6e2566c5e', 'sophia_l', 'sophia_l@example.com', 'Sophia Lee', 'Creating beautiful things ✨ Design @ Creative', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?w=800&q=80", "location": "London, UK"}'::jsonb WHERE id = '29209b5b-6a45-4650-aac7-50d6e2566c5e';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('6b64a534-b8cb-485f-8a72-10bd3f876fff', '00000000-0000-0000-0000-000000000000', 'liamp@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Liam Patel"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('6b64a534-b8cb-485f-8a72-10bd3f876fff', 'liamp', 'liamp@example.com', 'Liam Patel', 'Fitness | Health | Mindset 💪', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", "location": "Toronto, Canada"}'::jsonb WHERE id = '6b64a534-b8cb-485f-8a72-10bd3f876fff';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('48fd3313-058e-44bf-96e0-a0145a35d943', '00000000-0000-0000-0000-000000000000', 'liv_garcia@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Olivia Garcia"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('48fd3313-058e-44bf-96e0-a0145a35d943', 'liv_garcia', 'liv_garcia@example.com', 'Olivia Garcia', 'Foodie 🍕 | Exploring the world one plate at a time.', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "location": "Madrid, Spain"}'::jsonb WHERE id = '48fd3313-058e-44bf-96e0-a0145a35d943';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('5a9bb5f0-0272-4f5e-83c0-79537c0c3087', '00000000-0000-0000-0000-000000000000', 'noah_smith@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Noah Smith"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'noah_smith', 'noah_smith@example.com', 'Noah Smith', 'Musician 🎸 | Making waves', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80", "location": "Austin, TX"}'::jsonb WHERE id = '5a9bb5f0-0272-4f5e-83c0-79537c0c3087';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('99ac3c33-a767-4e31-a51b-73909e9f8289', '00000000-0000-0000-0000-000000000000', 'avaj@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ava Johnson"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('99ac3c33-a767-4e31-a51b-73909e9f8289', 'avaj', 'avaj@example.com', 'Ava Johnson', 'Plant mom 🌿 | Nature lover', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1470071131384-001b85755536?w=800&q=80", "location": "Portland, OR"}'::jsonb WHERE id = '99ac3c33-a767-4e31-a51b-73909e9f8289';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('37a00b47-65e7-4b86-af53-fbf5a9e12eae', '00000000-0000-0000-0000-000000000000', 'will_b@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"William Brown"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'will_b', 'will_b@example.com', 'William Brown', 'Code & Coffee 💻', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80", "location": "Seattle, WA"}'::jsonb WHERE id = '37a00b47-65e7-4b86-af53-fbf5a9e12eae';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('47307a70-b9c7-41d6-87bb-f9b0d4fc957b', '00000000-0000-0000-0000-000000000000', 'bella_d@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Isabella Davis"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'bella_d', 'bella_d@example.com', 'Isabella Davis', 'Fashion & Style 👗✨', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80", "location": "Paris, France"}'::jsonb WHERE id = '47307a70-b9c7-41d6-87bb-f9b0d4fc957b';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('b1c1745b-5077-4c08-b014-8b782c22836f', '00000000-0000-0000-0000-000000000000', 'lucasm@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lucas Miller"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('b1c1745b-5077-4c08-b014-8b782c22836f', 'lucasm', 'lucasm@example.com', 'Lucas Miller', 'Visual artist | NFT Creator 🎨', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", "location": "Berlin, Germany"}'::jsonb WHERE id = 'b1c1745b-5077-4c08-b014-8b782c22836f';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('a0983f86-4812-47d2-992b-052e6af693c4', '00000000-0000-0000-0000-000000000000', 'mia_w@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mia Wilson"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('a0983f86-4812-47d2-992b-052e6af693c4', 'mia_w', 'mia_w@example.com', 'Mia Wilson', 'Just living life ✌️', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", "location": "Sydney, Australia"}'::jsonb WHERE id = 'a0983f86-4812-47d2-992b-052e6af693c4';

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('92591183-d56e-425c-8142-a260a541ecbe', '00000000-0000-0000-0000-000000000000', 'ethant@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ethan Taylor"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('92591183-d56e-425c-8142-a260a541ecbe', 'ethant', 'ethant@example.com', 'Ethan Taylor', 'Gamer 🎮 | Streamer', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio, 
  verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80", "location": "Tokyo, Japan"}'::jsonb WHERE id = '92591183-d56e-425c-8142-a260a541ecbe';

-- 2. FOLLOWERS
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', '84ad35bc-5be1-42b1-947a-e073538fd82d', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', '29209b5b-6a45-4650-aac7-50d6e2566c5e', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', '29209b5b-6a45-4650-aac7-50d6e2566c5e', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', '6b64a534-b8cb-485f-8a72-10bd3f876fff', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', '6b64a534-b8cb-485f-8a72-10bd3f876fff', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', '48fd3313-058e-44bf-96e0-a0145a35d943', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', '48fd3313-058e-44bf-96e0-a0145a35d943', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', '99ac3c33-a767-4e31-a51b-73909e9f8289', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', '99ac3c33-a767-4e31-a51b-73909e9f8289', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', now() - interval '6 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '99ac3c33-a767-4e31-a51b-73909e9f8289', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', now() - interval '6 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '99ac3c33-a767-4e31-a51b-73909e9f8289', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', now() - interval '7 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '37a00b47-65e7-4b86-af53-fbf5a9e12eae', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', now() - interval '7 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'b1c1745b-5077-4c08-b014-8b782c22836f', now() - interval '8 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'b1c1745b-5077-4c08-b014-8b782c22836f', now() - interval '8 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'a0983f86-4812-47d2-992b-052e6af693c4', now() - interval '9 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), 'b1c1745b-5077-4c08-b014-8b782c22836f', 'a0983f86-4812-47d2-992b-052e6af693c4', now() - interval '9 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), 'b1c1745b-5077-4c08-b014-8b782c22836f', '92591183-d56e-425c-8142-a260a541ecbe', now() - interval '10 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), 'a0983f86-4812-47d2-992b-052e6af693c4', '92591183-d56e-425c-8142-a260a541ecbe', now() - interval '10 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), 'a0983f86-4812-47d2-992b-052e6af693c4', '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', now() - interval '11 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '92591183-d56e-425c-8142-a260a541ecbe', '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', now() - interval '11 days') ON CONFLICT DO NOTHING;
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), '92591183-d56e-425c-8142-a260a541ecbe', '84ad35bc-5be1-42b1-947a-e073538fd82d', now() - interval '12 days') ON CONFLICT DO NOTHING;

-- 3. PROFILE UPDATE

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
UPDATE public.users 
SET username = 'rajsoni', full_name = 'Raj Soni', bio = 'Building the future with code 🚀 | Tech enthusiast | Creator of Omnix', verified = true
WHERE id = (SELECT id FROM my_user);

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", "location": "Silicon Valley", "website": "https://github.com"}'::jsonb
WHERE id = (SELECT id FROM my_user);

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', id, now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), id, '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', id, now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), id, '84ad35bc-5be1-42b1-947a-e073538fd82d', now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', id, now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), id, '29209b5b-6a45-4650-aac7-50d6e2566c5e', now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', id, now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), id, '6b64a534-b8cb-485f-8a72-10bd3f876fff', now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', id, now() FROM my_user ON CONFLICT DO NOTHING;

WITH my_user AS (SELECT id FROM auth.users WHERE email = 'rajsoni4418@gmail.com' LIMIT 1)
INSERT INTO public.followers (id, follower_id, following_id, created_at) SELECT gen_random_uuid(), id, '48fd3313-058e-44bf-96e0-a0145a35d943', now() FROM my_user ON CONFLICT DO NOTHING;

-- 4. POSTS
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000001', '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'Loving the vibes here today! ✨', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000002', '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'Exploring new places 🌍', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000003', '84ad35bc-5be1-42b1-947a-e073538fd82d', 'Coffee and code 💻☕️', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000004', '84ad35bc-5be1-42b1-947a-e073538fd82d', 'Nature is beautiful 🌿', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000005', '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'City lights 🌃', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000006', '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'Beach day! 🏖️', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000007', '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'Delicious food 🍕', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000008', '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'Aesthetic moments ✨', 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000009', '48fd3313-058e-44bf-96e0-a0145a35d943', 'Just relaxing 😌', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000010', '48fd3313-058e-44bf-96e0-a0145a35d943', 'Sunsets like this 🌅', 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000001', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'Loving the vibes here today! ✨', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000002', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'Exploring new places 🌍', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000003', '99ac3c33-a767-4e31-a51b-73909e9f8289', 'Coffee and code 💻☕️', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000004', '99ac3c33-a767-4e31-a51b-73909e9f8289', 'Nature is beautiful 🌿', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000005', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'City lights 🌃', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000006', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'Beach day! 🏖️', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000007', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'Delicious food 🍕', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000008', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'Aesthetic moments ✨', 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000009', 'b1c1745b-5077-4c08-b014-8b782c22836f', 'Just relaxing 😌', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000010', 'b1c1745b-5077-4c08-b014-8b782c22836f', 'Sunsets like this 🌅', 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000001', 'a0983f86-4812-47d2-992b-052e6af693c4', 'Loving the vibes here today! ✨', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000002', 'a0983f86-4812-47d2-992b-052e6af693c4', 'Exploring new places 🌍', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000003', '92591183-d56e-425c-8142-a260a541ecbe', 'Coffee and code 💻☕️', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', NULL, now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at) VALUES ('f0000000-0000-0000-0000-000000000004', '92591183-d56e-425c-8142-a260a541ecbe', 'Nature is beautiful 🌿', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', NULL, now() - interval '4 days') ON CONFLICT DO NOTHING;

-- 5. COMMENTS
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', '84ad35bc-5be1-42b1-947a-e073538fd82d', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000002', '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000002', '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000003', '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000003', '48fd3313-058e-44bf-96e0-a0145a35d943', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000004', '48fd3313-058e-44bf-96e0-a0145a35d943', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000004', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000005', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000005', '99ac3c33-a767-4e31-a51b-73909e9f8289', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000006', '99ac3c33-a767-4e31-a51b-73909e9f8289', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000006', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000007', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000007', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000008', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000008', 'b1c1745b-5077-4c08-b014-8b782c22836f', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000009', 'b1c1745b-5077-4c08-b014-8b782c22836f', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000009', 'a0983f86-4812-47d2-992b-052e6af693c4', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000010', 'a0983f86-4812-47d2-992b-052e6af693c4', 'This is absolutely gorgeous! 😍🔥', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.comments (id, post_id, user_id, comment, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000010', '92591183-d56e-425c-8142-a260a541ecbe', 'Wow, keep up the amazing work!', now() - interval '1 days') ON CONFLICT DO NOTHING;

-- 6. LIKES
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', '84ad35bc-5be1-42b1-947a-e073538fd82d', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', '29209b5b-6a45-4650-aac7-50d6e2566c5e', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', '6b64a534-b8cb-485f-8a72-10bd3f876fff', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000002', '84ad35bc-5be1-42b1-947a-e073538fd82d', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000002', '29209b5b-6a45-4650-aac7-50d6e2566c5e', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000002', '6b64a534-b8cb-485f-8a72-10bd3f876fff', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000002', '48fd3313-058e-44bf-96e0-a0145a35d943', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000003', '29209b5b-6a45-4650-aac7-50d6e2566c5e', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000003', '6b64a534-b8cb-485f-8a72-10bd3f876fff', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000003', '48fd3313-058e-44bf-96e0-a0145a35d943', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000003', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000004', '6b64a534-b8cb-485f-8a72-10bd3f876fff', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000004', '48fd3313-058e-44bf-96e0-a0145a35d943', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000004', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000004', '99ac3c33-a767-4e31-a51b-73909e9f8289', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000005', '48fd3313-058e-44bf-96e0-a0145a35d943', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000005', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000005', '99ac3c33-a767-4e31-a51b-73909e9f8289', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000005', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000006', '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000006', '99ac3c33-a767-4e31-a51b-73909e9f8289', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000006', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000006', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000007', '99ac3c33-a767-4e31-a51b-73909e9f8289', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000007', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000007', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000007', 'b1c1745b-5077-4c08-b014-8b782c22836f', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000008', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000008', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000008', 'b1c1745b-5077-4c08-b014-8b782c22836f', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000008', 'a0983f86-4812-47d2-992b-052e6af693c4', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000009', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000009', 'b1c1745b-5077-4c08-b014-8b782c22836f', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000009', 'a0983f86-4812-47d2-992b-052e6af693c4', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000009', '92591183-d56e-425c-8142-a260a541ecbe', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000010', 'b1c1745b-5077-4c08-b014-8b782c22836f', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000010', 'a0983f86-4812-47d2-992b-052e6af693c4', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000010', '92591183-d56e-425c-8142-a260a541ecbe', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000010', '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', now() - interval '3 days') ON CONFLICT DO NOTHING;

-- 7. STORIES
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', now() + interval '24 hours', now() - interval '0 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', now() + interval '24 hours', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', now() + interval '24 hours', now() - interval '2 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', now() + interval '24 hours', now() - interval '3 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', now() + interval '24 hours', now() - interval '4 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80', now() + interval '24 hours', now() - interval '5 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '99ac3c33-a767-4e31-a51b-73909e9f8289', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', now() + interval '24 hours', now() - interval '6 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80', now() + interval '24 hours', now() - interval '7 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', now() + interval '24 hours', now() - interval '8 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), 'b1c1745b-5077-4c08-b014-8b782c22836f', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80', now() + interval '24 hours', now() - interval '9 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), 'a0983f86-4812-47d2-992b-052e6af693c4', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', now() + interval '24 hours', now() - interval '10 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at) VALUES (gen_random_uuid(), '92591183-d56e-425c-8142-a260a541ecbe', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', now() + interval '24 hours', now() - interval '11 hours') ON CONFLICT DO NOTHING;

-- 8. OMNICLIPS
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '0 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '1 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '99ac3c33-a767-4e31-a51b-73909e9f8289', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '6 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '7 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '8 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), 'b1c1745b-5077-4c08-b014-8b782c22836f', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '9 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), 'a0983f86-4812-47d2-992b-052e6af693c4', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '10 days') ON CONFLICT DO NOTHING;
INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at) VALUES (gen_random_uuid(), '92591183-d56e-425c-8142-a260a541ecbe', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this epic clip! 🎬', now() - interval '11 days') ON CONFLICT DO NOTHING;

-- 9. COMMUNITIES
INSERT INTO public.communities (id, name, description, owner_id, created_at) VALUES ('3568b94f-9999-443c-917e-aa0983c45556', 'Photography Lovers', 'Share your best shots!', '92591183-d56e-425c-8142-a260a541ecbe', now()) ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, name, description, owner_id, created_at) VALUES ('32dbfd2f-c857-4943-a9b2-602d244e03ac', 'Tech Talk', 'All about the latest tech', '37a00b47-65e7-4b86-af53-fbf5a9e12eae', now()) ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, name, description, owner_id, created_at) VALUES ('d8cd76ce-4270-4878-beb1-b940af820827', 'Fitness Goals', 'Workout routines and motivation', '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', now()) ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, name, description, owner_id, created_at) VALUES ('b2562b6c-7817-471a-81ed-76ec933c09a8', 'Foodies Unite', 'Recipes and restaurant reviews', 'b1c1745b-5077-4c08-b014-8b782c22836f', now()) ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, name, description, owner_id, created_at) VALUES ('45b677f3-c41d-454d-b89a-2d614e5b78b9', 'Travel Bugs', 'Wanderlust and adventures', '48fd3313-058e-44bf-96e0-a0145a35d943', now()) ON CONFLICT DO NOTHING;

-- 10. NOTIFICATIONS
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'follow', false, 'James Carter started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', 'follow', false, 'Sophia Lee started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'follow', false, 'Liam Patel started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'follow', false, 'Olivia Garcia started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', 'follow', false, 'Noah Smith started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'follow', false, 'Ava Johnson started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '99ac3c33-a767-4e31-a51b-73909e9f8289', 'follow', false, 'William Brown started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '37a00b47-65e7-4b86-af53-fbf5a9e12eae', 'follow', false, 'Isabella Davis started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '47307a70-b9c7-41d6-87bb-f9b0d4fc957b', 'follow', false, 'Lucas Miller started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), 'b1c1745b-5077-4c08-b014-8b782c22836f', 'follow', false, 'Mia Wilson started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), 'a0983f86-4812-47d2-992b-052e6af693c4', 'follow', false, 'Ethan Taylor started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (id, user_id, type, is_read, title, created_at) VALUES (gen_random_uuid(), '92591183-d56e-425c-8142-a260a541ecbe', 'follow', false, 'Emma Wilson started following you', now() - interval '1 hours') ON CONFLICT DO NOTHING;

-- 11. CHATS & MESSAGES
INSERT INTO public.chats (id, created_at) VALUES ('cd3277b0-f642-449b-90cd-df2becf839d0', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.chats (id, created_at) VALUES ('34ab2fd3-2e25-49d6-9b83-7c13d82c6e99', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.chats (id, created_at) VALUES ('51473c3b-78aa-46a9-acef-3e19109eee15', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.chats (id, created_at) VALUES ('f27dce39-744f-4530-9a57-f33a3a7f6506', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.chats (id, created_at) VALUES ('99396c87-0af7-47d6-bfa5-f35a6466f353', now() - interval '5 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'Hey, how have you been?', 'cd3277b0-f642-449b-90cd-df2becf839d0', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', 'Good! Exploring some new code lately.', 'cd3277b0-f642-449b-90cd-df2becf839d0', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', 'Awesome, let us build something together!', 'cd3277b0-f642-449b-90cd-df2becf839d0', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', 'Hey, how have you been?', '34ab2fd3-2e25-49d6-9b83-7c13d82c6e99', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'Good! Exploring some new code lately.', '34ab2fd3-2e25-49d6-9b83-7c13d82c6e99', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '84ad35bc-5be1-42b1-947a-e073538fd82d', 'Awesome, let us build something together!', '34ab2fd3-2e25-49d6-9b83-7c13d82c6e99', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'Hey, how have you been?', '51473c3b-78aa-46a9-acef-3e19109eee15', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'Good! Exploring some new code lately.', '51473c3b-78aa-46a9-acef-3e19109eee15', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '29209b5b-6a45-4650-aac7-50d6e2566c5e', 'Awesome, let us build something together!', '51473c3b-78aa-46a9-acef-3e19109eee15', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'Hey, how have you been?', 'f27dce39-744f-4530-9a57-f33a3a7f6506', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', 'Good! Exploring some new code lately.', 'f27dce39-744f-4530-9a57-f33a3a7f6506', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '6b64a534-b8cb-485f-8a72-10bd3f876fff', 'Awesome, let us build something together!', 'f27dce39-744f-4530-9a57-f33a3a7f6506', now() - interval '2 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', 'Hey, how have you been?', '99396c87-0af7-47d6-bfa5-f35a6466f353', now() - interval '4 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '5a9bb5f0-0272-4f5e-83c0-79537c0c3087', 'Good! Exploring some new code lately.', '99396c87-0af7-47d6-bfa5-f35a6466f353', now() - interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO public.messages (id, sender_id, message, chat_id, created_at) VALUES (gen_random_uuid(), '48fd3313-058e-44bf-96e0-a0145a35d943', 'Awesome, let us build something together!', '99396c87-0af7-47d6-bfa5-f35a6466f353', now() - interval '2 days') ON CONFLICT DO NOTHING;

