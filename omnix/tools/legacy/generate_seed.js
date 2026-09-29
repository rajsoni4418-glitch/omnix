import fs from 'fs';
import crypto from 'crypto';

const uuidv4 = () => crypto.randomUUID();

const myEmail = 'rajsoni4418@gmail.com';

const fakeUsers = [
  { id: uuidv4(), name: 'Emma Wilson', username: 'emma_w', bio: 'Photography & Travel 📸✈️', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', cover: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', location: 'New York, USA' },
  { id: uuidv4(), name: 'James Carter', username: 'jcarter', bio: 'Tech enthusiast. Coffee addict. ☕️', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', cover: 'https://images.unsplash.com/photo-1517430816045-df4b7ef11df1?w=800&q=80', location: 'San Francisco, CA' },
  { id: uuidv4(), name: 'Sophia Lee', username: 'sophia_l', bio: 'Creating beautiful things ✨ Design @ Creative', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', cover: 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?w=800&q=80', location: 'London, UK' },
  { id: uuidv4(), name: 'Liam Patel', username: 'liamp', bio: 'Fitness | Health | Mindset 💪', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', cover: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', location: 'Toronto, Canada' },
  { id: uuidv4(), name: 'Olivia Garcia', username: 'liv_garcia', bio: 'Foodie 🍕 | Exploring the world one plate at a time.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', cover: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', location: 'Madrid, Spain' },
  { id: uuidv4(), name: 'Noah Smith', username: 'noah_smith', bio: 'Musician 🎸 | Making waves', avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80', location: 'Austin, TX' },
  { id: uuidv4(), name: 'Ava Johnson', username: 'avaj', bio: 'Plant mom 🌿 | Nature lover', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', cover: 'https://images.unsplash.com/photo-1470071131384-001b85755536?w=800&q=80', location: 'Portland, OR' },
  { id: uuidv4(), name: 'William Brown', username: 'will_b', bio: 'Code & Coffee 💻', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80', cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', location: 'Seattle, WA' },
  { id: uuidv4(), name: 'Isabella Davis', username: 'bella_d', bio: 'Fashion & Style 👗✨', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', cover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', location: 'Paris, France' },
  { id: uuidv4(), name: 'Lucas Miller', username: 'lucasm', bio: 'Visual artist | NFT Creator 🎨', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80', cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', location: 'Berlin, Germany' },
  { id: uuidv4(), name: 'Mia Wilson', username: 'mia_w', bio: 'Just living life ✌️', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', location: 'Sydney, Australia' },
  { id: uuidv4(), name: 'Ethan Taylor', username: 'ethant', bio: 'Gamer 🎮 | Streamer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80', location: 'Tokyo, Japan' }
];

const postImages = [
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
  'https://images.unsplash.com/photo-1517430816045-df4b7ef11df1?w=800&q=80',
  'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?w=800&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
  'https://images.unsplash.com/photo-1470071131384-001b85755536?w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
  'https://images.unsplash.com/photo-1454372182658-c712e4c5a1db?w=800&q=80'
];

const postCaptions = [
  'What a beautiful day! ☀️ #sunshine',
  'Exploring new places 🌍 #travel',
  'Coffee time ☕️ #coffeelover',
  'Just finished a great workout 💪 #fitness',
  'Delicious food! 🍕 #foodie',
  'Loving this view 🏙️ #cityscape',
  'Nature is amazing 🌿 #nature',
  'Coding away... 💻 #developer',
  'Hanging out with friends! 🎉 #weekend',
  'Thinking about the future 🤔 #deepthoughts',
  'Feeling inspired today ✨ #inspiration',
  'Enjoying the little things 😌 #mindfulness'
];

const videoUrls = [
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bolt-detection.mp4',
  'https://raw.githubusercontent.com/mdn/learning-area/master/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/classroom.mp4',
  'https://raw.githubusercontent.com/mdn/learning-area/master/javascript/apis/video-audio/finished/video/sintel-short.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/car-detection.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/people-detection.mp4'
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

let sql = `-- Seed file generated for Omnix Test Data\n\n`;

// 1. Insert Fake Users into auth.users and public.users
sql += `-- INSERT FAKE USERS\n`;
fakeUsers.forEach(u => {
  sql += `
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('${u.id}', '00000000-0000-0000-0000-000000000000', '${u.username}@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"${escapeSql(u.name)}"}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, full_name, bio, verified)
VALUES ('${u.id}', '${u.username}', '${escapeSql(u.name)}', '${escapeSql(u.bio)}', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, 
  full_name = EXCLUDED.full_name, 
  bio = EXCLUDED.bio,
  verified = true;

-- Update auth meta for avatar/cover
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "${u.avatar}", "cover_url": "${u.cover}", "location": "${escapeSql(u.location)}"}'::jsonb WHERE id = '${u.id}';
`;
});

// 2. Update My Account (CTE)
sql += `
-- UPDATE MY ACCOUNT
WITH my_user AS (
  SELECT id FROM auth.users WHERE email = '${myEmail}' LIMIT 1
)
UPDATE public.users 
SET 
  username = 'rajsoni',
  full_name = 'Raj Soni',
  bio = 'Building the future with code 🚀 | Tech enthusiast | Creator of Omnix',
  verified = true
WHERE id = (SELECT id FROM my_user);

WITH my_user AS (
  SELECT id FROM auth.users WHERE email = '${myEmail}' LIMIT 1
)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80", "cover_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", "location": "Silicon Valley", "website": "https://github.com"}'::jsonb
WHERE id = (SELECT id FROM my_user);
`;

// 3. Generate Posts for fake users
sql += `\n-- GENERATE POSTS FOR FAKE USERS\n`;
let postIds = [];
for (let i = 0; i < 70; i++) {
  const u = randomItem(fakeUsers);
  const postId = uuidv4();
  postIds.push(postId);
  const image = randomItem(postImages);
  const caption = randomItem(postCaptions);
  const daysAgo = Math.floor(Math.random() * 30);
  sql += `INSERT INTO public.posts (id, user_id, caption, image_url, created_at) VALUES ('${postId}', '${u.id}', '${escapeSql(caption)}', '${image}', now() - interval '${daysAgo} days');\n`;
}

// 4. Generate Posts for My Account
sql += `\n-- GENERATE POSTS FOR MY ACCOUNT\n`;
for (let i = 0; i < 30; i++) {
  const postId = uuidv4();
  postIds.push(postId);
  const image = randomItem(postImages);
  const caption = randomItem(postCaptions) + ' #omnix';
  const daysAgo = Math.floor(Math.random() * 60);
  sql += `
WITH my_user AS (SELECT id FROM auth.users WHERE email = '${myEmail}' LIMIT 1)
INSERT INTO public.posts (id, user_id, caption, image_url, created_at) 
SELECT '${postId}', id, '${escapeSql(caption)}', '${image}', now() - interval '${daysAgo} days' FROM my_user;
`;
}

// 5. Generate Omniclips for My Account and others
sql += `\n-- GENERATE OMNICLIPS\n`;
let clipIds = [];
for (let i = 0; i < 30; i++) {
  const clipId = uuidv4();
  clipIds.push(clipId);
  const u = randomItem(fakeUsers);
  const video = randomItem(videoUrls);
  const caption = 'Awesome clip! 🎬 ' + randomItem(postCaptions);
  const daysAgo = Math.floor(Math.random() * 15);
  sql += `INSERT INTO public.omniclips (id, user_id, caption, video_url, created_at) VALUES ('${clipId}', '${u.id}', '${escapeSql(caption)}', '${video}', now() - interval '${daysAgo} days');\n`;
}
for (let i = 0; i < 20; i++) {
  const clipId = uuidv4();
  clipIds.push(clipId);
  const video = randomItem(videoUrls);
  const caption = 'My new clip! 🎥';
  const daysAgo = Math.floor(Math.random() * 20);
  sql += `
WITH my_user AS (SELECT id FROM auth.users WHERE email = '${myEmail}' LIMIT 1)
INSERT INTO public.omniclips (id, user_id, caption, video_url, created_at) 
SELECT '${clipId}', id, '${escapeSql(caption)}', '${video}', now() - interval '${daysAgo} days' FROM my_user;
`;
}

// 6. Generate Stories for My Account and others
sql += `\n-- GENERATE STORIES\n`;
for (let i = 0; i < 15; i++) {
  const u = randomItem(fakeUsers);
  const image = randomItem(postImages);
  sql += `INSERT INTO public.stories (id, user_id, media_url, created_at, expires_at) VALUES (gen_random_uuid(), '${u.id}', '${image}', now() - interval '5 hours', now() + interval '19 hours');\n`;
}
for (let i = 0; i < 8; i++) {
  const image = randomItem(postImages);
  sql += `
WITH my_user AS (SELECT id FROM auth.users WHERE email = '${myEmail}' LIMIT 1)
INSERT INTO public.stories (id, user_id, media_url, created_at, expires_at) 
SELECT gen_random_uuid(), id, '${image}', now() - interval '2 hours', now() + interval '22 hours' FROM my_user;
`;
}

// 7. Generate Followers
sql += `\n-- GENERATE FOLLOWERS\n`;
// Fake users follow each other
for (let i = 0; i < 40; i++) {
  const follower = randomItem(fakeUsers);
  const following = randomItem(fakeUsers);
  if (follower.id !== following.id) {
    sql += `INSERT INTO public.followers (follower_id, following_id, created_at) VALUES ('${follower.id}', '${following.id}', now()) ON CONFLICT DO NOTHING;\n`;
  }
}
// Fake users follow My Account
fakeUsers.forEach(u => {
  sql += `
WITH my_user AS (SELECT id FROM auth.users WHERE email = '${myEmail}' LIMIT 1)
INSERT INTO public.followers (follower_id, following_id, created_at) 
SELECT '${u.id}', id, now() FROM my_user ON CONFLICT DO NOTHING;
`;
});
// My Account follows some Fake users
fakeUsers.slice(0, 8).forEach(u => {
  sql += `
WITH my_user AS (SELECT id FROM auth.users WHERE email = '${myEmail}' LIMIT 1)
INSERT INTO public.followers (follower_id, following_id, created_at) 
SELECT id, '${u.id}', now() FROM my_user ON CONFLICT DO NOTHING;
`;
});

// 8. Generate Likes and Comments on Posts
sql += `\n-- GENERATE LIKES & COMMENTS\n`;
for (let i = 0; i < 200; i++) {
  const postId = randomItem(postIds);
  const u = randomItem(fakeUsers);
  sql += `INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES (gen_random_uuid(), '${postId}', '${u.id}', now()) ON CONFLICT DO NOTHING;\n`;
}
const comments = ['Nice!', 'Love this ❤️', 'Great shot!', 'Wow, amazing.', 'Looks fun!', 'Inspiring 🌟'];
for (let i = 0; i < 80; i++) {
  const postId = randomItem(postIds);
  const u = randomItem(fakeUsers);
  const text = randomItem(comments);
  sql += `INSERT INTO public.comments (id, post_id, user_id, content, created_at) VALUES (gen_random_uuid(), '${postId}', '${u.id}', '${escapeSql(text)}', now());\n`;
}

// 9. Generate Communities
sql += `\n-- GENERATE COMMUNITIES\n`;
const communities = [
  { id: uuidv4(), name: 'Photography Lovers', description: 'Share your best shots!', cover_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  { id: uuidv4(), name: 'Tech Talk', description: 'All about the latest tech', cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
  { id: uuidv4(), name: 'Fitness Goals', description: 'Workout routines and motivation', cover_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' },
  { id: uuidv4(), name: 'Foodies Unite', description: 'Recipes and restaurant reviews', cover_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { id: uuidv4(), name: 'Travel Bugs', description: 'Wanderlust and adventures', cover_image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80' }
];

communities.forEach(c => {
  const creator = randomItem(fakeUsers);
  sql += `
INSERT INTO public.communities (id, name, description, cover_image, created_by, created_at) 
VALUES ('${c.id}', '${escapeSql(c.name)}', '${escapeSql(c.description)}', '${c.cover_image}', '${creator.id}', now())
ON CONFLICT (id) DO NOTHING;
`;
});

fs.writeFileSync('seed_data.sql', sql);
console.log('Successfully generated seed_data.sql');
