import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseKey, getSupabaseUrl } from './env'

let directFetchFailedRecently = false;

function createResilientFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
    
    // Only intercept requests directed to Supabase REST / Auth / Storage
    if (!urlStr || !urlStr.includes('.supabase.co')) {
      return fetch(input, init);
    }

    const forwardToProxy = async () => {
      const u = new URL(urlStr);
      const proxyUrl = `/api/supabase-proxy?path=${encodeURIComponent(u.pathname)}${u.search ? `&${u.search.slice(1)}` : ''}`;
      return fetch(proxyUrl, init);
    };

    // On restricted networks (such as Maya OS / Linux with NIC DNS 164.100.3.1),
    // direct connection to *.supabase.co fails with net::ERR_SSL_PROTOCOL_ERROR.
    // Always routing through /api/supabase-proxy guarantees the browser never connects
    // directly to *.supabase.co.
    try {
      return await forwardToProxy();
    } catch (proxyErr) {
      console.warn('Proxy fetch warning, trying direct fetch as fallback:', proxyErr);
      return await fetch(input, init);
    }
  };
}


export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseKey(), {
    global: {
      fetch: createResilientFetch(),
    },
  });
}
