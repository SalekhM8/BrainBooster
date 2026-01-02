import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Simple in-memory cache for frequently accessed data
const cache = new Map<string, { data: unknown; expires: number }>();

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number = 60): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Helper for parallel queries
export async function parallelQueries<T extends readonly unknown[]>(
  queries: [...{ [K in keyof T]: Promise<T[K]> }]
): Promise<T> {
  return Promise.all(queries) as Promise<T>;
}

// Common select patterns for optimization
export const userSelectMinimal = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

export const userSelectWithRole = {
  ...userSelectMinimal,
  role: true,
  email: true,
  isActive: true,
} as const;

export const sessionSelectMinimal = {
  id: true,
  title: true,
  subject: true,
  yearGroup: true,
  scheduledAt: true,
} as const;

export const recordingSelectMinimal = {
  id: true,
  title: true,
  subject: true,
  duration: true,
  createdAt: true,
} as const;
