// High-performance fetcher with error handling
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  
  return res.json();
};

// Fetcher with pagination support
export const paginatedFetcher = async <T>(url: string): Promise<{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  
  return res.json();
};

// Build URL with query params
export function buildUrl(base: string, params: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(base, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

