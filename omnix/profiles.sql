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
