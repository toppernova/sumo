/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCloudPasscodeHash, saveCloudPasscodeHash, updateSupabaseUserPassword } from '../lib/supabase';

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
  const cleanInput = (input || '').trim();
  if (!cleanInput) return false;

  const inputHash = await hashPasscode(cleanInput);

  // 1. Check Cloud Hash from Supabase first (shared across all devices & incognito)
  try {
    const cloudHash = await getCloudPasscodeHash();
    if (cloudHash) {
      if (inputHash === cloudHash) {
        // Cache to local storage
        localStorage.setItem(STORAGE_HASH_KEY, cloudHash);
        localStorage.setItem('blog_admin_has_custom_passcode', 'true');
        return true;
      }
      // If cloud has custom password, admin123 is strictly blocked
      if (cleanInput === DEFAULT_PASSCODE) {
        return false;
      }
      return false;
    }
  } catch {}

  // 2. If custom passcode was set locally, admin123 is strictly blocked
  if (hasCustomPasscodeSet() && cleanInput === DEFAULT_PASSCODE) {
    return false;
  }

  // 3. Fallback to local stored hash
  const storedHash = await getStoredPasscodeHash();
  return inputHash === storedHash;
}

export async function changeAdminPasscode(
  currentPasscode: string,
  newPasscode: string
): Promise<{ success: boolean; message: string }> {
  // If user is already an authenticated admin with valid session, allow changing directly!
  const isSessionAuth = isSessionValid();
  if (!isSessionAuth) {
    const isCurrentValid = await verifyPasscode(currentPasscode);
    if (!isCurrentValid) {
      return {
        success: false,
        message: 'Current password galat hai! Kripya sahi purana password enter karein.',
      };
    }
  }

  const cleanNew = (newPasscode || '').trim();
  if (!cleanNew || cleanNew.length < 6) {
    return {
      success: false,
      message: 'Naya password kam se kam 6 characters ka hona chahiye.',
    };
  }

  const newHash = await hashPasscode(cleanNew);

  // 1. Save in local browser storage
  setStoredPasscodeHash(newHash);
  localStorage.setItem('blog_admin_has_custom_passcode', 'true');

  // 2. Sync to Supabase Cloud so all devices & incognito tabs get the new password
  try {
    await saveCloudPasscodeHash(newHash);
  } catch {}

  // 3. Also update Supabase Auth User password if an account is connected
  try {
    await updateSupabaseUserPassword(cleanNew);
  } catch {}

  return {
    success: true,
    message: 'Admin password successfully change ho gaya hai!',
  };
}

export function hasCustomPasscodeSet(): boolean {
  return localStorage.getItem('blog_admin_has_custom_passcode') === 'true';
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
