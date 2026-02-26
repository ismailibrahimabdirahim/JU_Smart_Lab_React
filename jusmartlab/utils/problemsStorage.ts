/**
 * Persist problem reports to localStorage so submitted problems appear in Manage Reports
 * and survive page refresh. Web: localStorage. Native: in-memory only unless you add AsyncStorage.
 */

import type { ProblemSubmission } from '@/types';

const KEY = 'jusmartlab_problems';
const KEY_NEXT_ID = 'jusmartlab_problems_next_id';

function isWeb(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as unknown as { localStorage?: Storage }).localStorage !== 'undefined';
}

/** Returns stored problems; empty array when none (no mock/temporary data). */
export function getStoredProblems(): ProblemSubmission[] {
  if (isWeb()) {
    try {
      const raw = (window as unknown as Window & { localStorage: Storage }).localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProblemSubmission[];
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
  }
  return [];
}

export function setStoredProblems(problems: ProblemSubmission[]): void {
  if (isWeb()) {
    try {
      (window as unknown as Window & { localStorage: Storage }).localStorage.setItem(
        KEY,
        JSON.stringify(problems)
      );
    } catch {
      // ignore
    }
  }
}

export function getStoredNextId(): number {
  if (isWeb()) {
    try {
      const raw = (window as unknown as Window & { localStorage: Storage }).localStorage.getItem(KEY_NEXT_ID);
      if (raw) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) return n;
      }
    } catch {
      // ignore
    }
  }
  return 10;
}

export function setStoredNextId(id: number): void {
  if (isWeb()) {
    try {
      (window as unknown as Window & { localStorage: Storage }).localStorage.setItem(
        KEY_NEXT_ID,
        String(id)
      );
    } catch {
      // ignore
    }
  }
}
