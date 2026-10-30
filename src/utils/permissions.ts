import { AppPermissionsState } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesize a clean, subtle tactile click / chime sound on task completion
 * (Inspired by Things 3's satisfying completion acoustic feedback)
 */
export function playCompletionSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle melodic two-tone chime (587.33Hz D5 -> 880Hz A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  } catch (e) {
    console.debug('Audio feedback unavailable:', e);
  }
}

/**
 * Check existing permissions across browser APIs
 */
export async function checkPermissions(): Promise<AppPermissionsState> {
  const notif = typeof Notification !== 'undefined' ? Notification.permission : 'default';
  let storagePersisted = false;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      storagePersisted = await navigator.storage.persisted();
    } catch {
      storagePersisted = false;
    }
  }

  const badging = typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
  const audioStored = localStorage.getItem('omnisticky_audio_sound') !== 'false';

  return {
    notifications: notif,
    audioEnabled: audioStored,
    persistentStorage: storagePersisted,
    badgingSupported: badging,
  };
}

/**
 * Request Browser Notifications Permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendLocalNotification('OmniSticky Alerts Active', {
        body: 'You will receive reminders for scheduled tasks and focus timers.',
      });
    }
    return permission;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return 'denied';
  }
}

/**
 * Send an OS/Browser Notification
 */
export function sendLocalNotification(title: string, options?: NotificationOptions): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    });
  } catch (err) {
    console.warn('Failed to fire notification:', err);
  }
}

/**
 * Request Browser Storage Persistence (guarantees offline cache won't be purged)
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Update PWA/App Icon Badge with count of pending Today tasks
 */
export function updateAppBadge(pendingCount: number): void {
  if (typeof navigator === 'undefined' || !('setAppBadge' in navigator)) return;
  try {
    if (pendingCount > 0) {
      (navigator as any).setAppBadge(pendingCount);
    } else {
      (navigator as any).clearAppBadge();
    }
  } catch (e) {
    console.debug('App badge not supported or restricted:', e);
  }
}

