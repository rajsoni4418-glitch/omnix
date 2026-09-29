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
