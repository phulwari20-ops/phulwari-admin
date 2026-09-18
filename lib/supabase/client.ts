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

    // If direct fetch is known to be blocked on this network, use proxy immediately
    if (directFetchFailedRecently) {
      try {
        return await forwardToProxy();
      } catch (_) {
        directFetchFailedRecently = false; // Reset to retry direct if proxy failed
      }
    }

    try {
      const res = await fetch(input, init);
      directFetchFailedRecently = false;
      return res;
    } catch (directErr) {
      // Direct call failed (e.g. net::ERR_SSL_PROTOCOL_ERROR on restricted government network)
      directFetchFailedRecently = true;
      try {
        return await forwardToProxy();
      } catch (proxyErr) {
        throw directErr;
      }
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
