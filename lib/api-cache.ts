const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_PREFIX = "api-cache:";

type CacheRecord<T> = {
  expiresAt: number;
  payload: T;
};

const memoryCache = new Map<string, CacheRecord<unknown>>();

function getStorageKey(key: string) {
  return `${CACHE_PREFIX}${key}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readFromSessionStorage<T>(key: string): CacheRecord<T> | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(getStorageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheRecord<T>;
    return parsed;
  } catch {
    return null;
  }
}

function writeToSessionStorage<T>(key: string, value: CacheRecord<T>) {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch {
    // Ignore storage quota and availability issues
  }
}

export async function getCachedApiJson<T>(
  url: string,
  options?: { ttlMs?: number; cacheKey?: string }
): Promise<T> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const cacheKey = options?.cacheKey ?? url;
  const now = Date.now();

  const mem = memoryCache.get(cacheKey) as CacheRecord<T> | undefined;
  if (mem && mem.expiresAt > now) {
    return mem.payload;
  }

  const fromStorage = readFromSessionStorage<T>(cacheKey);
  if (fromStorage && fromStorage.expiresAt > now) {
    memoryCache.set(cacheKey, fromStorage);
    return fromStorage.payload;
  }

  const response = await fetch(url);
  const payload = (await response.json()) as T;
  const record: CacheRecord<T> = {
    expiresAt: now + ttlMs,
    payload,
  };

  memoryCache.set(cacheKey, record);
  writeToSessionStorage(cacheKey, record);
  return payload;
}

export function getCachedApiJsonSync<T>(
  key: string
): { hit: boolean; payload: T | null } {
  const now = Date.now();
  const mem = memoryCache.get(key) as CacheRecord<T> | undefined;
  if (mem && mem.expiresAt > now) {
    return { hit: true, payload: mem.payload };
  }

  const fromStorage = readFromSessionStorage<T>(key);
  if (fromStorage && fromStorage.expiresAt > now) {
    memoryCache.set(key, fromStorage);
    return { hit: true, payload: fromStorage.payload };
  }

  return { hit: false, payload: null };
}

