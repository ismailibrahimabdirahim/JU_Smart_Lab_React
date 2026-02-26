/**
 * Persist onboarding completion so repeat visits skip onboarding.
 * Web: localStorage. Native: in-memory (add @react-native-async-storage/async-storage for persistence).
 */

const KEY = 'jusmartlab_onboarding_complete';

let memoryStore: boolean | null = null;

function isWeb(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as unknown as { localStorage?: Storage }).localStorage !== 'undefined';
}

export function getOnboardingComplete(): boolean {
  if (isWeb()) {
    try {
      const raw = (window as unknown as Window & { localStorage: Storage }).localStorage.getItem(KEY);
      return raw === 'true';
    } catch {
      return false;
    }
  }
  return memoryStore === true;
}

export function setOnboardingComplete(value: boolean): void {
  if (isWeb()) {
    try {
      (window as unknown as Window & { localStorage: Storage }).localStorage.setItem(KEY, String(value));
    } catch {
      // ignore
    }
  }
  memoryStore = value;
}
