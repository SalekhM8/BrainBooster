"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Search, User, Calendar, PlayCircle, Loader2 } from "lucide-react";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

interface SearchData {
  results: SearchResult[];
}

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query for performance
  const debouncedQuery = useDebounce(query, 300);

  // Use SWR with conditional fetching
  const { data, isLoading } = useSWR<SearchData>(
    debouncedQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const results = data?.results || [];

  // Handle click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Set up click outside listener
  useMemo(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const getIcon = useCallback((type: string) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4" />;
      case "session":
        return <Calendar className="w-4 h-4" />;
      case "recording":
        return <PlayCircle className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  }, []);

  const handleResultClick = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Desktop: Full search bar */}
      <div className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl bg-pastel-blue/20 border-2 border-transparent hover:border-pastel-blue-border/30 focus-within:border-pastel-blue-border focus-within:bg-white transition-all duration-200 w-64">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search..."
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none font-bold tracking-tightest min-w-0"
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-pastel-blue-border animate-spin shrink-0" />
        )}
      </div>
      
      {/* Mobile/Tablet: Just icon button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="lg:hidden p-3 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-pastel-blue/30 transition-all duration-200"
      >
        <Search className="w-5 h-5" />
      </button>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-pastel-blue-border/20 z-50 max-h-[400px] overflow-y-auto w-80 lg:w-full lg:left-0">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={result.link}
              onClick={handleResultClick}
              className="flex items-center gap-4 p-4 hover:bg-pastel-blue/10 first:rounded-t-2xl last:rounded-b-2xl transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-pastel-blue/20 flex items-center justify-center text-slate-500 group-hover:bg-pastel-blue group-hover:text-slate-700 transition-colors">
                {getIcon(result.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate tracking-tightest group-hover:text-pastel-blue-border transition-colors">{result.title}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-bold">{result.subtitle}</p>
              </div>
              <span className="text-[10px] text-slate-400 capitalize font-bold bg-slate-50 px-2 py-1 rounded-lg">{result.type}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Mobile search input popup */}
      {isOpen && (
        <div className="lg:hidden absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-pastel-blue-border/20 z-50 p-3 w-80">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-pastel-blue/20 border-2 border-pastel-blue-border">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none font-bold tracking-tightest min-w-0"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-pastel-blue-border animate-spin shrink-0" />
            )}
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full right-0 mt-2 lg:left-0 bg-white rounded-2xl shadow-2xl border-2 border-pastel-blue-border/20 z-50 p-6 text-center w-80 lg:w-full">
          <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-bold tracking-tightest">No results found</p>
        </div>
      )}
    </div>
  );
}
