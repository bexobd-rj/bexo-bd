import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;

/**
 * Validates that the request comes from an authenticated Admin user via Supabase Auth JWT.
 */
export async function authenticateAdmin(req: any): Promise<{ authenticated: boolean; user?: any; error?: string }> {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    let token = '';

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    } else if (req.body && req.body.authToken) {
      token = req.body.authToken;
    }

    if (!token) {
      return { authenticated: false, error: 'Authorization token required. Please sign in as an admin.' };
    }

    if (!supabase) {
      // If Supabase is not yet configured with keys, we cannot verify tokens
      return { authenticated: false, error: 'Supabase configuration is missing on server.' };
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { authenticated: false, error: 'Invalid or expired session. Please re-authenticate.' };
    }

    // Check if user is an admin
    const isAdminEmail = user.email === 'bexobd@gmail.com';
    const hasAdminMeta = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';

    if (isAdminEmail || hasAdminMeta) {
      return { authenticated: true, user };
    }

    // Check profile in database
    const { data: profile } = await supabase
      .from('bexo_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile && profile.role === 'admin') {
      return { authenticated: true, user };
    }

    return { authenticated: false, error: 'Forbidden: Admin privileges required.' };
  } catch (err: any) {
    return { authenticated: false, error: 'Authentication verification failed: ' + (err.message || 'Unknown error') };
  }
}

/**
 * Validates URLs against SSRF (Server-Side Request Forgery) attacks.
 * Blocks private IP spaces, loopbacks, link-local, cloud metadata services, and unsafe schemes.
 */
export function isSafeUrl(urlString: string): { safe: boolean; error?: string; url?: URL } {
  if (!urlString || typeof urlString !== 'string') {
    return { safe: false, error: 'URL is required.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { safe: false, error: 'Invalid URL format.' };
  }

  // 1. Only allow HTTP and HTTPS protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, error: 'Invalid protocol. Only http:// and https:// URLs are permitted.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Reject localhost and local names
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan')
  ) {
    return { safe: false, error: 'Access to localhost and internal hostnames is prohibited.' };
  }

  // 3. Reject IPv4 Private, Loopback, Link-Local, and Broadcast ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const octets = [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      parseInt(match[4], 10)
    ];

    if (octets.some(o => isNaN(o) || o < 0 || o > 255)) {
      return { safe: false, error: 'Invalid IP address format.' };
    }

    const [o1, o2] = octets;

    // 0.0.0.0/8 (Current network)
    if (o1 === 0) return { safe: false, error: 'Access to 0.0.0.0/8 network is prohibited.' };
    // 10.0.0.0/8 (Private)
    if (o1 === 10) return { safe: false, error: 'Access to private IP range (10.0.0.0/8) is prohibited.' };
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return { safe: false, error: 'Access to loopback IP range (127.0.0.0/8) is prohibited.' };
    // 169.254.0.0/16 (Link-local / AWS/GCP Metadata 169.254.169.254)
    if (o1 === 169 && o2 === 254) return { safe: false, error: 'Access to link-local / cloud metadata range is prohibited.' };
    // 172.16.0.0/12 (Private)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return { safe: false, error: 'Access to private IP range (172.16.0.0/12) is prohibited.' };
    // 192.168.0.0/16 (Private)
    if (o1 === 192 && o2 === 168) return { safe: false, error: 'Access to private IP range (192.168.0.0/16) is prohibited.' };
    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (o1 >= 224) return { safe: false, error: 'Access to multicast/reserved IP ranges is prohibited.' };
  }

  // 4. Reject IPv6 Hex / Link-Local / Unique Local
  if (
    hostname.startsWith('fe80:') ||
    hostname.startsWith('fc00:') ||
    hostname.startsWith('fd00:') ||
    hostname.includes(':::')
  ) {
    return { safe: false, error: 'Access to private IPv6 address ranges is prohibited.' };
  }

  return { safe: true, url: parsed };
}
