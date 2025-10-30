"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { SiPlaystation, SiSteam } from "react-icons/si";
import { TbBrandElectronicArts } from "react-icons/tb";
import { FaXbox } from "react-icons/fa";

interface SearchResult {
  platformId: number;
  platformSlug: string;
  platformUserIdentifier: string;
  platformUserId: string | null;
  platformUserHandle: string;
  avatarUrl: string | null;
  titleUserId: string;
  status: string;
  additionalParameters: any;
  metadata: {
    countryCode?: string;
  };
}

interface SearchResponse {
  data: SearchResult[];
}

const PLATFORMS = [
  { value: "origin", label: "EA", icon: TbBrandElectronicArts },
  { value: "psn", label: "PSN", icon: SiPlaystation },
  { value: "xbl", label: "Xbox", icon: FaXbox },
  { value: "steam", label: "Steam", icon: SiSteam },
] as const;

// Icon mapping for search results
const getPlatformIcon = (platformSlug: string) => {
  switch (platformSlug) {
    case "psn":
      return SiPlaystation;
    case "xbl":
      return FaXbox;
    case "steam":
      return SiSteam;
    default:
      return TbBrandElectronicArts;
  }
};

// Platform label mapping for display
const getPlatformLabel = (platformSlug: string) => {
  switch (platformSlug) {
    case "psn":
      return "PSN";
    case "xbl":
      return "Xbox";
    case "steam":
      return "Steam";
    case "origin":
      return "EA";
    default:
      return platformSlug.toUpperCase();
  }
};

export default function PlayerSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("origin");
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        platformRef.current &&
        !platformRef.current.contains(event.target as Node)
      ) {
        setIsPlatformDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.tracker.gg/api/v2/bf6/standard/search?platform=${selectedPlatform}&query=${encodeURIComponent(query)}&autocomplete=true`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data: SearchResponse = await response.json();
          setResults(data.data || []);
          setIsOpen(data.data && data.data.length > 0);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, selectedPlatform]);

  const handleSelectPlayer = (result: SearchResult) => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("bf6_playerId", result.titleUserId);
      localStorage.setItem("bf6_platform", result.platformSlug);
    }

    // Update URL with playerId and platform
    const params = new URLSearchParams();
    params.set("playerId", result.titleUserId);
    params.set("platform", result.platformSlug);
    router.push(`/?${params.toString()}`);
    setQuery(result.platformUserHandle);
    setIsOpen(false);
  };

  // Load saved player from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlayerId = localStorage.getItem("bf6_playerId");
      const savedPlatform = localStorage.getItem("bf6_platform");
      const urlPlayerId = searchParams.get("playerId");
      
      // If no playerId in URL but we have one in localStorage, use it
      if (!urlPlayerId && savedPlayerId) {
        setSelectedPlatform(savedPlatform || "origin");
        // Note: We don't set the query here to avoid showing the name
        // The page component will handle loading the data
      } else if (urlPlayerId) {
        // If we have a playerId in URL, set the platform from URL
        const urlPlatform = searchParams.get("platform");
        if (urlPlatform) {
          setSelectedPlatform(urlPlatform);
        }
      }
    }
  }, [searchParams]);

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="flex gap-2">
        {/* Platform Selector - Custom Dropdown */}
        <div ref={platformRef} className="relative">
          <button
            type="button"
            onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
            className="pl-10 pr-4 py-2 bg-gray-800/70  border border-gray-700/70 rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer flex items-center gap-2 min-w-[120px]"
          >
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {(() => {
                const platform = PLATFORMS.find((p) => p.value === selectedPlatform);
                const Icon = platform?.icon;
                return Icon ? <Icon className="w-5 h-5 text-gray-400" /> : null;
              })()}
            </div>
            <span className="text-white">
              {PLATFORMS.find((p) => p.value === selectedPlatform)?.label}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isPlatformDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Platform Dropdown Options */}
          {isPlatformDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-gray-800/90  border border-gray-700/70 rounded-lg shadow-xl overflow-hidden">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(platform.value);
                      setResults([]);
                      setIsOpen(false);
                      setIsPlatformDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 hover:bg-gray-700/40 transition-colors text-left flex items-center gap-3 ${
                      selectedPlatform === platform.value
                        ? "bg-gray-700/40"
                        : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-white">{platform.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder="Search for a player..."
            className="w-full px-4 py-2 bg-gray-800/70  border border-gray-700/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800/90  border border-gray-700/70 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.titleUserId}-${index}`}
              onClick={() => handleSelectPlayer(result)}
              className="w-full px-4 py-3 hover:bg-gray-700/40 transition-colors text-left flex items-center gap-3 border-b border-gray-700/70 last:border-b-0"
            >
              {result.avatarUrl && (
                <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={result.avatarUrl}
                    alt={result.platformUserHandle}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold truncate">
                    {result.platformUserHandle}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const Icon = getPlatformIcon(result.platformSlug);
                      return <Icon className="w-4 h-4 text-gray-400" />;
                    })()}
                    <span className="text-xs text-gray-400 uppercase px-2 py-0.5 bg-gray-700 rounded">
                      {getPlatformLabel(result.platformSlug)}
                    </span>
                  </div>
                  {result.metadata?.countryCode && (
                    <span className="text-xs text-gray-500">
                      {result.metadata.countryCode}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{result.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

