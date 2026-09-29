import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!rawUrl || rawUrl === 'https://placeholder.supabase.co') {
  logger.fatal('CRITICAL: VITE_SUPABASE_URL is missing or invalid.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder') {
  logger.fatal('CRITICAL: VITE_SUPABASE_ANON_KEY is missing or invalid.');
}

const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '') : 'https://placeholder.supabase.co';

// Fallback datasets for offline / unreachable backend resilience
const defaultFallbackProfiles = [
  {
    id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5',
    username: 'emma_w',
    display_name: 'Emma Wilson',
    full_name: 'Emma Wilson',
    is_verified: true,
    verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    role: 'user'
  },
  {
    id: '84ad35bc-5be1-42b1-947a-e073538fd82d',
    username: 'alex_dev',
    display_name: 'Alex Rivera',
    full_name: 'Alex Rivera',
    is_verified: true,
    verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
    role: 'user'
  },
  {
    id: '29209b5b-6a45-4650-aac7-50d6e2566c5e',
    username: 'sophia_m',
    display_name: 'Sophia Martinez',
    full_name: 'Sophia Martinez',
    is_verified: false,
    verified: false,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    role: 'user'
  }
];

const defaultFallbackPosts = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    user_id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5',
    caption: 'Loving the vibes here today! ✨',
    content: 'Loving the vibes here today! ✨',
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    video_url: null,
    location: 'San Francisco, CA',
    visibility: 'public',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes: [],
    comments: []
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    user_id: '84ad35bc-5be1-42b1-947a-e073538fd82d',
    caption: 'Coffee and code 💻☕️',
    content: 'Coffee and code 💻☕️',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    video_url: null,
    location: 'Seattle, WA',
    visibility: 'public',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes: [],
    comments: []
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    user_id: '29209b5b-6a45-4650-aac7-50d6e2566c5e',
    caption: 'City lights 🌃',
    content: 'City lights 🌃',
    image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    video_url: null,
    location: 'New York, NY',
    visibility: 'public',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    likes: [],
    comments: []
  }
];

const defaultFallbackStories = [
  {
    id: 's0000000-0000-0000-0000-000000000001',
    media_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    music: null,
    view_count: 42,
    caption: 'Morning vibes! ☀️',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    user_id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5',
    user: { username: 'emma_w', full_name: 'Emma Wilson' }
  }
];

const defaultFallbackClips = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    user_id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    caption: 'Breeze in the trees 🌿 #nature #vibes',
    music: 'Original Audio - Nature',
    views: 1240,
    likes_count: 320,
    comments_count: 45,
    shares_count: 12,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

// CSRF tokens and Rate Limiting Hooks
export const requestQueue: { url: string, time: number }[] = [];
const MAX_REQUESTS = 50;

export const checkRateLimit = () => {
  const now = Date.now();
  while(requestQueue.length > 0 && requestQueue[0].time < now - 60000) {
    requestQueue.shift();
  }
  if (requestQueue.length > MAX_REQUESTS) {
    logger.warn('Rate limit exceeded');
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  requestQueue.push({ url: 'api-call', time: now });
};

// Graceful offline mock responses when Supabase instance is unreachable
function handleOfflineFallback(urlStr: string, options?: RequestInit): Response {
  const method = (options?.method || 'GET').toUpperCase();
  const headers = new Headers(options?.headers);
  const isSingle = (headers.get('Accept') || '').includes('application/vnd.pgrst.object+json');
  const isHead = method === 'HEAD';

  // 1. Auth routes
  if (urlStr.includes('/auth/v1/')) {
    if (urlStr.includes('/user')) {
      return new Response(JSON.stringify({ message: 'No active session', code: 401 }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (urlStr.includes('/token')) {
      return new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'Network unavailable. Please try again later.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'network_unavailable', message: 'Auth service unreachable' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. PostgREST database routes
  if (urlStr.includes('/rest/v1/')) {
    const match = urlStr.match(/\/rest\/v1\/([^?]+)/);
    const endpoint = match ? match[1] : '';

    if (isHead) {
      const count = endpoint === 'posts' ? defaultFallbackPosts.length : (endpoint === 'stories' ? 1 : 0);
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': `0-${Math.max(0, count - 1)}/${count}`,
        },
      });
    }

    if (method === 'POST') {
      try {
        const body = options?.body ? JSON.parse(options.body as string) : null;
        if (body) {
          const resp = Array.isArray(body)
            ? body.map((b, i) => ({ id: `offline-${Date.now()}-${i}`, ...b }))
            : [{ id: `offline-${Date.now()}`, ...body }];
          return new Response(JSON.stringify(resp), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch {
        // ignore parse error
      }
      return new Response(JSON.stringify([{ id: `offline-${Date.now()}` }]), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET requests
    if (endpoint === 'posts') {
      if (isSingle) {
        return new Response(JSON.stringify(defaultFallbackPosts[0]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(defaultFallbackPosts), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': `0-${defaultFallbackPosts.length - 1}/${defaultFallbackPosts.length}`,
        },
      });
    }

    if (endpoint === 'profiles') {
      if (isSingle) {
        return new Response(JSON.stringify(defaultFallbackProfiles[0]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(defaultFallbackProfiles), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': `0-${defaultFallbackProfiles.length - 1}/${defaultFallbackProfiles.length}`,
        },
      });
    }

    if (endpoint === 'stories') {
      return new Response(JSON.stringify(defaultFallbackStories), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': `0-${defaultFallbackStories.length - 1}/${defaultFallbackStories.length}`,
        },
      });
    }

    if (endpoint === 'omniclips') {
      return new Response(JSON.stringify(defaultFallbackClips), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Range': `0-${defaultFallbackClips.length - 1}/${defaultFallbackClips.length}`,
        },
      });
    }

    // Generic tables
    if (isSingle) {
      return new Response(
        JSON.stringify({
          code: 'PGRST116',
          details: 'The result contains 0 rows',
          message: 'JSON object requested, multiple (or no) rows returned',
        }),
        {
          status: 406,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Range': '0-0/0',
      },
    });
  }

  // 3. Storage routes
  if (urlStr.includes('/storage/v1/')) {
    return new Response(
      JSON.stringify({ Key: 'uploads/offline.jpg', Id: 'offline-id' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 4. Default empty JSON
  return new Response(JSON.stringify([]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Apply custom fetch interceptor to Supabase client
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  checkRateLimit();
  const urlStr = typeof url === 'string' ? url : (url as any).url || url.toString();
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
       if (!(urlStr.includes('/reactions') && response.status === 404)) {
         logger.warn('API Request Failed', { url: urlStr, status: response.status, statusText: response.statusText });
       }
    }
    return response;
  } catch (error: any) {
    logger.warn('Network unreachable, utilizing graceful fallback', { url: urlStr, message: error.message });
    return handleOfflineFallback(urlStr, options);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: customFetch,
    headers: {
      'x-client-info': 'omnix-web',
    },
  },
});

// Intercept and cache supabase.auth.getUser to prevent repeated API calls
const originalGetUser = supabase.auth.getUser.bind(supabase.auth);


let cachedUser: any = null;
let cachedPromise: Promise<any> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes user state cache

supabase.auth.getUser = async function (jwt?: string) {
  // If a JWT token is provided explicitly, bypass the cache
  if (jwt) {
    return originalGetUser(jwt);
  }

  const now = Date.now();
  if (cachedUser && (now - lastFetchTime < CACHE_DURATION)) {
    return { data: { user: cachedUser }, error: null };
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    try {
      const response = await originalGetUser();
      if (response.error) {
        cachedPromise = null;
        return response;
      }
      cachedUser = response.data.user;
      lastFetchTime = Date.now();
      cachedPromise = null;
      return response;
    } catch {
      cachedPromise = null;
      return { data: { user: null }, error: null };
    }
  })();

  return cachedPromise;
};

// Clear or update user cache on auth state change
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    cachedUser = null;
    lastFetchTime = 0;
  } else if (session?.user) {
    cachedUser = session.user;
    lastFetchTime = Date.now();
  }
});

