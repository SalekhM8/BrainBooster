"use client";

import { SWRConfig, Cache } from "swr";
import { fetcher } from "./fetcher";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

// Custom cache with size limit for memory efficiency
function createBoundedCache(maxSize: number = 100): () => Cache {
  return () => {
    const cache = new Map();
    
    return {
      get: (key: string) => cache.get(key),
      set: (key: string, value: unknown) => {
        // Evict oldest entries if over limit
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },
      delete: (key: string) => cache.delete(key),
      keys: () => cache.keys(),
    };
  };
}

export function SWRProvider({ children }: Props) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Performance: Disable automatic revalidation for better control
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        
        // Performance: Dedupe requests within 10 seconds
        dedupingInterval: 10000,
        
        // Resilience: Retry failed requests with exponential backoff
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        
        // UX: Keep showing old data while fetching new
        keepPreviousData: true,
        
        // Performance: Don't use suspense (prevents waterfall)
        suspense: false,
        
        // Memory: Use bounded cache
        provider: createBoundedCache(100),
        
        // Global error handler
        onError: (error, key) => {
          if (process.env.NODE_ENV === "development") {
            console.error(`SWR Error for ${key}:`, error);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
