import { supabase } from './supabase';

export async function logLoginAttempt(userId: string, isSuccess: boolean) {
  try {
    // Collect device info
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'Mac OS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('like Mac')) os = 'iOS';

    // Collect IP and Location (mocking via free API for demonstration)
    let ip = 'Unknown';
    let location = 'Unknown';
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        ip = data.ip;
        location = `${data.city}, ${data.country_name}`;
      }
    } catch {
      // IP lookup optional; fallback to Unknown
    }

    // Insert into login history
    const { data: newLogin, error } = await supabase.from('login_history').insert({
      user_id: userId,
      device_name: `${os} Device`,
      browser,
      os,
      ip_address: ip,
      location,
      is_success: isSuccess
    }).select().single();

    if (error || !newLogin) return;

    if (isSuccess) {
      // Check for suspicious login
      const { data: previousLogins } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .eq('is_success', true)
        .neq('id', newLogin.id)
        .order('login_time', { ascending: false });

      if (previousLogins && previousLogins.length > 0) {
        const lastLogin = previousLogins[0];
        const isNewDevice = lastLogin.os !== os || lastLogin.browser !== browser;
        const isNewLocation = lastLogin.location !== location && location !== 'Unknown';

        // In a real app we'd trigger a server-side email. 
        // We'll insert a notification record here if applicable.
        if (isNewDevice || isNewLocation) {
          console.warn('Suspicious login detected!');
          // e.g. await supabase.from('notifications').insert(...)
        }
      }
    }
  } catch (err) {
    console.error('Failed to log login attempt', err);
  }
}
