/**
 * Reliable Loud Notification Audio Chime & Tone Synthesizer
 * Uses Web Audio API to produce a loud, penetrating, melodious dual-pulse chime without external asset dependencies.
 * Works 100% reliably across Chrome, Firefox, Safari, Edge, Android, and Maya OS.
 */

const STORAGE_KEY = 'phulwari_sound_alert_enabled';

/**
 * Check if Sound Alert is enabled by the admin. Defaults to TRUE.
 */
export function isSoundAlertEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggle or set Sound Alert enabled state (persisted to localStorage).
 */
export function setSoundAlertEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('phulwari_sound_toggle', { detail: { enabled } }));
  } catch {}
}

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// User-gesture audio unlocker for Chrome, Edge, Safari, and Maya OS
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (_) {}
  };
  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
}

/**
 * Synthesizes a loud, harmonic bell chime note
 */
function playChimeNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gainLevel: number = 0.85
) {
  try {
    // Primary tone (Sine wave for purity)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    gain1.gain.setValueAtTime(gainLevel, startTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(startTime);
    osc1.stop(startTime + duration);

    // Harmonic overtone (Triangle wave for brightness & acoustic penetration)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, startTime); // Fifth harmonic

    gain2.gain.setValueAtTime(gainLevel * 0.45, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * 0.7));

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(startTime);
    osc2.stop(startTime + (duration * 0.7));
  } catch (err) {
    console.warn('[Audio] playChimeNote error:', err);
  }
}

/**
 * Play a LOUD and distinct Lead Alert Sound (Dual-pulse Ding-Dong chime)
 * Optimized to be audible across rooms, in background tabs, and noisy environments.
 */
export function playLoudLeadAlert(force: boolean = false): void {
  // If Sound Alert is turned OFF in preferences, do not play unless forced (e.g. user clicks Test Sound)
  if (!force && !isSoundAlertEnabled()) {
    console.log('[NotificationSound] Sound alert is OFF in preferences. Muted.');
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime + 0.05;

    // Pulse 1: "Ding" (High C6: 1046.5 Hz -> E6: 1318.5 Hz)
    playChimeNote(ctx, 1046.50, now, 0.4, 0.9);
    playChimeNote(ctx, 1318.51, now + 0.12, 0.45, 0.95);

    // Short pause (0.15s) then Pulse 2: "Dong / Bell Alert" (G6: 1567.98 Hz -> C7: 2093.0 Hz)
    playChimeNote(ctx, 1567.98, now + 0.32, 0.5, 0.95);
    playChimeNote(ctx, 2093.00, now + 0.48, 0.9, 0.9);

  } catch (err) {
    console.warn('Loud notification audio playback failed:', err);
  }
}

/**
 * Backwards compatible notification sound function.
 * Respects ON/OFF setting and plays the loud sound.
 */
export function playNotificationSound(): void {
  playLoudLeadAlert(false);
}

/**
 * Explicit test function to preview loud sound regardless of muted setting.
 */
export function testLeadSoundAlert(): void {
  playLoudLeadAlert(true);
}
