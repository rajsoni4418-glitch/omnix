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

const fakePosts = [
  { id: uuidv4(), caption: 'Loving the vibes here today! ✨', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80' },
  { id: uuidv4(), caption: 'Exploring new places 🌍', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80' },
  { id: uuidv4(), caption: 'Coffee and code 💻☕️', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' },
  { id: uuidv4(), caption: 'Nature is beautiful 🌿', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' },
  { id: uuidv4(), caption: 'City lights 🌃', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80' },
  { id: uuidv4(), caption: 'Beach day! 🏖️', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { id: uuidv4(), caption: 'Delicious food 🍕', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80' },
  { id: uuidv4(), caption: 'Aesthetic moments ✨', image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80' },
  { id: uuidv4(), caption: 'Just relaxing 😌', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80' },
  { id: uuidv4(), caption: 'Sunsets like this 🌅', image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80' }
];

function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// 1. Users
let usersSql = `-- USERS (Auth & Public)\n`;
fakeUsers.forEach(u => {
  usersSql += `
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES ('${u.id}', '00000000-0000-0000-0000-000000000000', '${u.username}@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":${escapeSql(u.name)}}', now(), now(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, username, email, full_name, bio, verified)
VALUES ('${u.id}', '${u.username}', '${u.username}@example.com', ${escapeSql(u.name)}, ${escapeSql(u.bio)}, true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, email = EXCLUDED.email, full_name = EXCLUDED.full_name, bio = EXCLUDED.bio, verified = true;

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"avatar_url": "${u.avatar}", "cover_url": "${u.cover}", "location": "${u.location}"}'::jsonb WHERE id = '${u.id}';
`;
});
fs.writeFileSync('public/sql/users.sql', usersSql);

// 2. Followers
let followersSql = `-- FOLLOWERS\n`;
for (let i = 0; i < 40; i++) {
  const follower = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  const following = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  if (follower.id !== following.id) {
    followersSql += `INSERT INTO public.followers (follower_id, following_id, created_at) VALUES ('${follower.id}', '${following.id}', now()) ON CONFLICT DO NOTHING;\n`;
  }
}
fs.writeFileSync('public/sql/followers.sql', followersSql);

// 3. Posts
let postsSql = `-- POSTS\n`;
fakeUsers.forEach(u => {
  for (let i=0; i<5; i++) {
    const post = fakePosts[Math.floor(Math.random() * fakePosts.length)];
    const pid = uuidv4();
    postsSql += `INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at, updated_at) VALUES ('${pid}', '${u.id}', ${escapeSql(post.caption)}, '${post.image}', NULL, now() - interval '${Math.floor(Math.random()*30)} days', now());\n`;
  }
});
fs.writeFileSync('public/sql/posts.sql', postsSql);

// 4. Comments
let commentsSql = `-- COMMENTS\n`;
// We don't have exact post IDs, so we'll just query them or create a small subset. Wait, we generated post IDs, let's capture them.
let allPostIds = [];
fakeUsers.forEach(u => {
  for (let i=0; i<2; i++) {
    allPostIds.push(uuidv4());
  }
});
postsSql = `-- POSTS\n`;
allPostIds.forEach((pid, idx) => {
  const u = fakeUsers[idx % fakeUsers.length];
  const post = fakePosts[idx % fakePosts.length];
  postsSql += `INSERT INTO public.posts (id, user_id, caption, image_url, video_url, created_at, updated_at) VALUES ('${pid}', '${u.id}', ${escapeSql(post.caption)}, '${post.image}', NULL, now() - interval '${Math.floor(Math.random()*30)} days', now());\n`;
});
fs.writeFileSync('public/sql/posts.sql', postsSql);

allPostIds.forEach(pid => {
  for (let i=0; i<3; i++) {
    const u = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
    commentsSql += `INSERT INTO public.comments (id, post_id, user_id, content, created_at, updated_at) VALUES ('${uuidv4()}', '${pid}', '${u.id}', 'This is great! 🔥', now() - interval '${Math.floor(Math.random()*10)} days', now());\n`;
  }
});
fs.writeFileSync('public/sql/comments.sql', commentsSql);

// 5. Stories
let storiesSql = `-- STORIES\n`;
fakeUsers.forEach(u => {
  storiesSql += `INSERT INTO public.stories (id, user_id, media_url, expires_at, created_at, updated_at) VALUES ('${uuidv4()}', '${u.id}', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', now() + interval '24 hours', now(), now());\n`;
});
fs.writeFileSync('public/sql/stories.sql', storiesSql);

// 6. OmniClips
let clipsSql = `-- OMNICLIPS\n`;
const verifiedSeeds = [
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bolt-detection.mp4',
  'https://raw.githubusercontent.com/mdn/learning-area/master/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/classroom.mp4',
  'https://raw.githubusercontent.com/mdn/learning-area/master/javascript/apis/video-audio/finished/video/sintel-short.mp4'
];
fakeUsers.forEach((u, idx) => {
  const seedVideo = verifiedSeeds[idx % verifiedSeeds.length];
  clipsSql += `INSERT INTO public.omniclips (id, user_id, video_url, thumbnail, caption, created_at, updated_at) VALUES ('${uuidv4()}', '${u.id}', '${seedVideo}', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 'Check out this clip! 🎬', now(), now());\n`;
});
fs.writeFileSync('public/sql/omniclips.sql', clipsSql);

// 7. Notifications
let notifSql = `-- NOTIFICATIONS\n`;
fakeUsers.forEach(u => {
  for (let i=0; i<3; i++) {
    const actor = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
    if (u.id !== actor.id) {
      notifSql += `INSERT INTO public.notifications (id, user_id, actor_id, type, read, created_at) VALUES ('${uuidv4()}', '${u.id}', '${actor.id}', 'follow', false, now());\n`;
    }
  }
});
fs.writeFileSync('public/sql/notifications.sql', notifSql);

console.log('All files generated.');
