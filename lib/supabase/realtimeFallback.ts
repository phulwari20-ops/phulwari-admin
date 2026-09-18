import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface RealtimeFallbackOptions {
  supabase: SupabaseClient;
  channelName: string;
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onDataChange: (payload?: any) => void;
  pollFn?: () => Promise<void> | void;
  pollIntervalMs?: number; // default: 12000 ms
}

export interface RealtimeSubscriptionHandle {
  unsubscribe: () => void;
  refetchNow: () => void;
  isRealtimeActive: () => boolean;
}

/**
 * Creates a Supabase Realtime subscription with an automatic, resilient HTTPS polling fallback.
 *
 * Behavior:
 * 1. Subscribes to Supabase Realtime channel with `postgres_changes`.
 * 2. If Realtime successfully connects (SUBSCRIBED):
 *    - Realtime is primary live update mechanism.
 *    - Fallback polling is paused.
 * 3. If Realtime encounters an error (CHANNEL_ERROR, TIMED_OUT, net::ERR_SSL_PROTOCOL_ERROR):
 *    - Detects connection failure cleanly without crashing.
 *    - Prevents aggressive reconnection loops.
 *    - Transparently activates targeted HTTPS polling (with Page Visibility pause).
 * 4. When Realtime recovers (SUBSCRIBED):
 *    - Polling automatically stops and Realtime live updates resume.
 * 5. Provides `refetchNow()` to trigger immediate fetch after user's own mutations.
 */
export function subscribeWithFallback(options: RealtimeFallbackOptions): RealtimeSubscriptionHandle {
  const {
    supabase,
    channelName,
    table,
    schema = 'public',
    event = '*',
    filter,
    onDataChange,
    pollFn,
    pollIntervalMs = 12000,
  } = options;

  let channel: RealtimeChannel | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isRealtimeConnected = false;
  let isUnmounted = false;
  let reconnectAttempts = 0;

  const startPolling = () => {
    if (pollTimer || isUnmounted) return;
    if (pollFn) {
      pollFn();
      pollTimer = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          return;
        }
        if (pollFn && !isUnmounted) {
          pollFn();
        }
      }, pollIntervalMs);
    }
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const scheduleRealtimeReconnect = () => {
    if (isUnmounted || isRealtimeConnected || reconnectTimer) return;
    reconnectAttempts++;
    const delay = Math.min(60000, 10000 * Math.pow(1.5, reconnectAttempts - 1));
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (!isUnmounted && !isRealtimeConnected) {
        initChannel();
      }
    }, delay);
  };

  const initChannel = () => {
    if (isUnmounted) return;

    try {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (_) {}
      }

      const channelBuilder = supabase.channel(channelName);
      const changeConfig: any = {
        event,
        schema,
        table,
      };
      if (filter) {
        changeConfig.filter = filter;
      }

      channel = channelBuilder
        .on('postgres_changes', changeConfig, (payload) => {
          onDataChange(payload);
        })
        .subscribe((status, err) => {
          if (isUnmounted) return;

          if (status === 'SUBSCRIBED') {
            isRealtimeConnected = true;
            reconnectAttempts = 0;
            stopPolling();
            console.log(`[Realtime Admin] Active for table "${table}" (Channel: ${channelName})`);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED' || err) {
            isRealtimeConnected = false;
            console.warn(`[Realtime Admin Fallback] Realtime unavailable for "${table}" (${status}). Switching to HTTPS polling fallback.`);
            startPolling();
            scheduleRealtimeReconnect();
          }
        });
    } catch (err) {
      console.warn(`[Realtime Admin Fallback] Exception initializing channel "${channelName}":`, err);
      isRealtimeConnected = false;
      startPolling();
      scheduleRealtimeReconnect();
    }
  };

  // Start Realtime connection
  initChannel();

  const handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && !document.hidden && !isRealtimeConnected && pollFn) {
      pollFn();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return {
    unsubscribe: () => {
      isUnmounted = true;
      stopPolling();
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (_) {}
        channel = null;
      }
    },
    refetchNow: () => {
      if (pollFn) {
        pollFn();
      }
    },
    isRealtimeActive: () => isRealtimeConnected,
  };
}
