"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  fetchKDRatio,
  fetchWLPercentage,
  fetchMatches,
  fetchProfile,
} from "@/lib/api";
import type {
  KDRatioData,
  WLPercentageData,
  MatchData,
  ProfileData,
} from "@/lib/api";
import KDRatioDashboard from "@/components/KDRatioDashboard";
import WLPercentageDashboard from "@/components/WLPercentageDashboard";
import MatchesDashboard from "@/components/MatchesDashboard";
import PlayerOverview from "@/components/PlayerOverview";
import PlayerSearch from "@/components/PlayerSearch";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kdRatio, setKDRatio] = useState<KDRatioData | null>(null);
  const [wlPercentage, setWLPercentage] = useState<WLPercentageData | null>(
    null
  );
  const [matches, setMatches] = useState<MatchData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<"matches" | "kd" | "wl">(
    "matches"
  );
  const [hasPlayerId, setHasPlayerId] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Get player ID and platform from URL query parameters first
        let playerId = searchParams.get("playerId");
        let platform = searchParams.get("platform") || "origin";

        // If no playerId in URL, check localStorage (only once)
        if (!playerId && typeof window !== "undefined" && !hasLoadedFromStorage.current) {
          const savedPlayerId = localStorage.getItem("bf6_playerId");
          const savedPlatform = localStorage.getItem("bf6_platform");
          if (savedPlayerId) {
            hasLoadedFromStorage.current = true;
            playerId = savedPlayerId;
            platform = savedPlatform || "origin";
            // Update URL to reflect saved player
            const params = new URLSearchParams();
            params.set("playerId", playerId);
            params.set("platform", platform);
            router.replace(`/?${params.toString()}`);
            setLoading(false);
            return; // Exit early, will be called again with new URL params
          }
        }

        setHasPlayerId(!!playerId);

        // If still no playerId, don't load data
        if (!playerId) {
          setLoading(false);
          return;
        }

        const [kdData, wlData, matchesData, profileData] = await Promise.all([
          fetchKDRatio(playerId, platform),
          fetchWLPercentage(playerId, platform),
          fetchMatches(playerId, platform),
          fetchProfile(playerId, platform),
        ]);

        setKDRatio(kdData);
        setWLPercentage(wlData);
        setMatches(matchesData);
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your Battlefield 6 stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Failed to Load Data
          </h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure you're accessing this page from a browser with proper
            cookies enabled. The API requires browser authentication to bypass
            Cloudflare protection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no player selected, show only the search box
  if (!hasPlayerId && !loading) {
    return (
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dwfcofnrd/image/fetch/f_auto,q_auto/w_1440/https://image.api.playstation.com/vulcan/ap/rnd/202507/2217/a744da857d797315f97de55df387866b9c3db39add49a948.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />
        {/* Dark Overlay for Readability */}
        <div className="fixed inset-0 z-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Battlefield 6 Performance Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                Search for a player to view their stats
              </p>
            </div>
            <div className="flex justify-center">
              <Suspense fallback={<div className="w-full max-w-2xl h-10 bg-gray-800 rounded-lg animate-pulse" />}>
                <PlayerSearch />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!kdRatio && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No K/D ratio data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dwfcofnrd/image/fetch/f_auto,q_auto/w_1440/https://image.api.playstation.com/vulcan/ap/rnd/202507/2217/a744da857d797315f97de55df387866b9c3db39add49a948.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Dark Overlay for Readability */}
      <div className="fixed inset-0 z-0 bg-black/55" />
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Battlefield 6 Performance Dashboard
                </h1>
                <p className="text-gray-400 mt-1">
                  Comprehensive K/D ratio and win rate analysis
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Suspense fallback={<div className="w-full max-w-2xl h-10 bg-gray-800 rounded-lg animate-pulse" />}>
                <PlayerSearch />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Player Overview - Always visible at top */}
        <PlayerOverview
          matches={matches}
          kdRatio={kdRatio}
          wlPercentage={wlPercentage}
          profile={profile}
        />

        {/* Tab Navigation */}
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg mb-6">
          <div className="flex border-b border-gray-800/30">
            <button
              onClick={() => setActiveTab("matches")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "matches"
                  ? "text-white border-b-2 border-blue-500 bg-gray-800/60"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              Match Performance
            </button>
            <button
              onClick={() => setActiveTab("kd")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "kd"
                  ? "text-white border-b-2 border-blue-500 bg-gray-800/60"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              K/D Ratio Analysis
            </button>
            <button
              onClick={() => setActiveTab("wl")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "wl"
                  ? "text-white border-b-2 border-blue-500 bg-gray-800/60"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              Win/Loss Analysis
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "matches" && matches && (
              <MatchesDashboard data={matches} />
            )}
            {activeTab === "kd" && kdRatio && (
              <KDRatioDashboard data={kdRatio} />
            )}
            {activeTab === "wl" && wlPercentage && (
              <WLPercentageDashboard data={wlPercentage} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-12 bg-gray-900/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Data provided by{" "}
            <a
              href="https://tracker.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Tracker.gg
            </a>
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your Battlefield 6 stats...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
