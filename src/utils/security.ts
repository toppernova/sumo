/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Enterprise-grade client security for Admin authentication
const SALT = 'sulekh_secure_admin_salt_v3';
const STORAGE_HASH_KEY = 'blog_admin_sec_hash_v3';
const STORAGE_SESSION_KEY = 'blog_admin_sec_session_v3';
const STORAGE_ATTEMPTS_KEY = 'blog_admin_fail_attempts_v3';
const STORAGE_LOCKOUT_KEY = 'blog_admin_lockout_until_v3';

// Default initial passcode is "admin123" (hashed)
// Generated with: sha256("admin123:sulekh_secure_admin_salt_v3")
const DEFAULT_PASSCODE = 'admin123';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

export async function hashPasscode(passcode: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${passcode}:${SALT}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getStoredPasscodeHash(): Promise<string> {
  const saved = localStorage.getItem(STORAGE_HASH_KEY);
  if (saved) return saved;
  // Initialize with default hashed passcode
  const defaultHash = await hashPasscode(DEFAULT_PASSCODE);
  localStorage.setItem(STORAGE_HASH_KEY, defaultHash);
  return defaultHash;
}

export function setStoredPasscodeHash(hash: string): void {
  localStorage.setItem(STORAGE_HASH_KEY, hash);
}

export async function verifyPasscode(input: string): Promise<boolean> {
  const inputHash = await hashPasscode(input);
  const storedHash = await getStoredPasscodeHash();
  return inputHash === storedHash;
}

export function checkLockout(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const lockoutUntilStr = localStorage.getItem(STORAGE_LOCKOUT_KEY);
    if (!lockoutUntilStr) return { isLocked: false, remainingSeconds: 0 };
    const lockoutUntil = parseInt(lockoutUntilStr, 10);
    const now = Date.now();
    if (now < lockoutUntil) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((lockoutUntil - now) / 1000),
      };
    } else {
      // Lockout expired, reset attempts
      localStorage.removeItem(STORAGE_LOCKOUT_KEY);
      localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      return { isLocked: false, remainingSeconds: 0 };
    }
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function recordFailedAttempt(): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  const lockout = checkLockout();
  if (lockout.isLocked) return { ...lockout, attemptsLeft: 0 };

  let current = 0;
  try {
    const saved = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
    current = saved ? parseInt(saved, 10) : 0;
  } catch {
    current = 0;
  }

  current += 1;
  localStorage.setItem(STORAGE_ATTEMPTS_KEY, current.toString());

  if (current >= MAX_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(STORAGE_LOCKOUT_KEY, lockoutUntil.toString());
    return {
      isLocked: true,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      attemptsLeft: 0,
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsLeft: MAX_ATTEMPTS - current,
  };
}

export function resetFailedAttempts(): void {
  localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
  localStorage.removeItem(STORAGE_LOCKOUT_KEY);
}

export function startAdminSession(): void {
  const session = {
    auth: true,
    expiresAt: Date.now() + SESSION_DURATION_MS,
    token: Math.random().toString(36).substring(2) + Date.now().toString(36),
  };
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
}

export function isSessionValid(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (session && session.auth && session.expiresAt > Date.now()) {
      return true;
    }
    // Expired
    localStorage.removeItem(STORAGE_SESSION_KEY);
    return false;
  } catch {
    return false;
  }
}

export function endAdminSession(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}
