"use client";

import Image from "next/image";
import type { MatchData, KDRatioData, WLPercentageData, ProfileData } from "@/lib/api";

interface PlayerOverviewProps {
  matches: MatchData | null;
  kdRatio: KDRatioData | null;
  wlPercentage: WLPercentageData | null;
  profile: ProfileData | null;
}

export default function PlayerOverview({
  matches,
  kdRatio,
  wlPercentage,
  profile,
}: PlayerOverviewProps) {
  if (!matches) return null;

  // Get matches data
  const matchesData = (matches.data?.matches ||
    (matches as any).matches ||
    []) as typeof matches.data.matches;
  const lastMatchIndex = matchesData.length > 0 ? matchesData.length - 1 : 0;
  const firstMatchIndex = 0;

  // Get both first and last match segments
  const firstMatchSegment = matchesData[firstMatchIndex]?.segments?.find(
    (s) => s.type === "overview"
  );
  const lastMatchSegment = matchesData[lastMatchIndex]?.segments?.find(
    (s) => s.type === "overview"
  );

  // Use the LAST match for cumulative stats (most complete cumulative data)
  // Delta snapshots: the last match typically has the most complete cumulative totals
  // Fallback to first match if last doesn't exist
  const overviewSegment = lastMatchSegment || firstMatchSegment;

  if (!overviewSegment) return null;

  const stats = overviewSegment.stats || {};
  const lastMatchStats = lastMatchSegment?.stats || {};
  const firstMatchStats = firstMatchSegment?.stats || {};

  // Get metadata from overview segment, with fallback to firstMatchSegment if needed
  const metadata = overviewSegment.metadata || firstMatchSegment?.metadata || {};
  const gamemodes = metadata.gamemodes || [];
  const weapons = metadata.weapons || [];
  const kits = metadata.kits || [];

  // Get current rank from first match
  const playerRank =
    firstMatchSegment?.stats?.careerPlayerRank?.value ||
    stats.careerPlayerRank?.value ||
    0;
  const rankImage =
    firstMatchSegment?.stats?.careerPlayerRank?.metadata?.imageUrl ||
    stats.careerPlayerRank?.metadata?.imageUrl;

  // Calculate key stats - find the highest cumulative values across all matches
  // Delta snapshots may reset stats, so we need to find the match with highest cumulative totals
  let maxMatches = 0;
  let maxWins = 0;
  let maxKills = 0;
  let maxDeaths = 0;
  
  // Iterate through all matches to find maximum cumulative values
  matchesData.forEach((match) => {
    const segment = match?.segments?.find((s) => s.type === "overview");
    if (segment?.stats) {
      const matchStats = segment.stats;
      if (matchStats.matchesPlayed?.value && matchStats.matchesPlayed.value > maxMatches) {
        maxMatches = matchStats.matchesPlayed.value;
      }
      if (matchStats.matchesWon?.value && matchStats.matchesWon.value > maxWins) {
        maxWins = matchStats.matchesWon.value;
      }
      if (matchStats.kills?.value && matchStats.kills.value > maxKills) {
        maxKills = matchStats.kills.value;
      }
      if (matchStats.deaths?.value && matchStats.deaths.value > maxDeaths) {
        maxDeaths = matchStats.deaths.value;
      }
    }
  });
  
  // Use maximum values found, with fallbacks to first/last match if needed
  const totalMatches = maxMatches || 
    (firstMatchStats.matchesPlayed?.value ??
    lastMatchStats.matchesPlayed?.value ??
    stats.matchesPlayed?.value ??
    0);
  const totalWins = maxWins ||
    (firstMatchStats.matchesWon?.value ??
    lastMatchStats.matchesWon?.value ??
    stats.matchesWon?.value ??
    0);
  const totalKills = maxKills ||
    (lastMatchStats.kills?.value ??
    stats.kills?.value ??
    firstMatchStats.kills?.value ??
    0);
  const totalDeaths = maxDeaths ||
    (lastMatchStats.deaths?.value ??
    stats.deaths?.value ??
    firstMatchStats.deaths?.value ??
    0);
  
  const overallKD = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
  const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

  // Get current K/D from KDRatio data
  const currentKD = kdRatio?.data?.history?.data
    ? kdRatio.data.history.data[kdRatio.data.history.data.length - 1]?.[1]
        ?.value || overallKD
    : overallKD;

  // Get current W/L from WLPercentage data
  const currentWL = wlPercentage?.data?.history?.data
    ? wlPercentage.data.history.data[
        wlPercentage.data.history.data.length - 1
      ]?.[1]?.value || winRate
    : winRate;

  // Find most played gamemode
  const mostPlayedGamemode = [...gamemodes]
    .filter((g) => g.stats.matchesPlayed > 0)
    .sort((a, b) => b.stats.matchesPlayed - a.stats.matchesPlayed)[0];

  // Find most used weapon
  const mostUsedWeapon = [...weapons]
    .filter((w) => w.stats.kills > 0)
    .sort((a, b) => b.stats.kills - a.stats.kills)[0];

  // Find most used kit/class
  const mostUsedKit = [...kits]
    .filter((k) => k.stats.timePlayed > 0)
    .sort((a, b) => b.stats.timePlayed - a.stats.timePlayed)[0];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get player name from profile
  const playerName = profile?.data?.platformInfo?.platformUserHandle || "Player";
  const playerAvatar = profile?.data?.platformInfo?.avatarUrl;

  return (
    <div className="bg-gray-900/80 border border-gray-700/70 rounded-lg p-6 mb-6 shadow-xl">
      {/* Player Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 pb-6 border-b border-gray-700">
        {/* Player Info with Avatar and Rank */}
        <div className="flex items-center gap-6">
          {rankImage && (
            <div className="w-28 h-28 relative flex-shrink-0">
              <Image
                src={rankImage}
                alt={`Rank ${playerRank}`}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {playerName}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-200 text-lg font-semibold">
                Rank #{playerRank}
              </p>
              {playerAvatar && (
                <div className="w-8 h-8 relative rounded-full overflow-hidden">
                  <Image
                    src={playerAvatar}
                    alt={playerName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <div className="bg-gray-800/80 rounded-lg p-4 text-center border border-gray-700/70 hover:border-blue-500 transition-colors">
            <p className="text-xs text-gray-300 uppercase mb-1 tracking-wider">K/D Ratio</p>
            <p className={`text-3xl font-bold ${currentKD >= 1 ? 'text-green-400' : 'text-red-400'}`}>
              {currentKD.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totalKills.toLocaleString()}K / {totalDeaths.toLocaleString()}D
            </p>
          </div>
          <div className="bg-gray-800/70 rounded-lg p-4 text-center border border-gray-700/70 hover:border-green-500 transition-colors">
            <p className="text-xs text-gray-400 uppercase mb-1 tracking-wider">Win Rate</p>
            <p className={`text-3xl font-bold ${currentWL >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {currentWL.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totalWins}W / {totalMatches - totalWins}L
            </p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4 text-center border border-gray-700 hover:border-purple-500 transition-colors">
            <p className="text-xs text-gray-400 uppercase mb-1 tracking-wider">Matches</p>
            <p className="text-3xl font-bold text-white">{totalMatches.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Total played</p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4 text-center border border-gray-700/70 hover:border-blue-500 transition-colors">
            <p className="text-xs text-gray-400 uppercase mb-1 tracking-wider">Kills</p>
            <p className="text-3xl font-bold text-blue-400">
              {totalKills.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total kills</p>
          </div>
        </div>
      </div>

      {/* Most Used/Played Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most Played Gamemode */}
        {mostPlayedGamemode && (
          <div className="bg-gray-800/30  rounded-lg p-4 border border-gray-700/50 hover:border-green-500 transition-colors">
            <p className="text-xs text-gray-300 uppercase mb-3 tracking-wider font-semibold">
              Most Played Gamemode
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 relative flex-shrink-0 bg-gray-900/50 rounded-lg p-2">
                <Image
                  src={mostPlayedGamemode.metadata.imageUrl}
                  alt={mostPlayedGamemode.metadata.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-lg truncate mb-1">
                  {mostPlayedGamemode.metadata.name}
                </h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-300">
                    {mostPlayedGamemode.stats.matchesPlayed} matches
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className={`font-semibold ${mostPlayedGamemode.stats.wlPercentage >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {mostPlayedGamemode.stats.wlPercentage.toFixed(1)}% win rate
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Most Used Weapon */}
        {mostUsedWeapon && (
          <div className="bg-gray-800/30  rounded-lg p-4 border border-gray-700/50 hover:border-blue-500 transition-colors">
            <p className="text-xs text-gray-300 uppercase mb-3 tracking-wider font-semibold">
              Most Used Weapon
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 relative flex-shrink-0 bg-gray-900/50 rounded-lg p-2">
                <Image
                  src={mostUsedWeapon.metadata.imageUrl}
                  alt={mostUsedWeapon.metadata.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-lg truncate mb-1">
                  {mostUsedWeapon.metadata.name}
                </h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-blue-400 font-semibold">
                    {mostUsedWeapon.stats.kills.toLocaleString()} kills
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300">
                    {(
                      mostUsedWeapon.stats.accuracy ||
                      mostUsedWeapon.stats.shotsAccuracy ||
                      0
                    ).toFixed(1)}% accuracy
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Most Used Kit */}
        {mostUsedKit && (
          <div className="bg-gray-800/30  rounded-lg p-4 border border-gray-700/50 hover:border-purple-500 transition-colors">
            <p className="text-xs text-gray-300 uppercase mb-3 tracking-wider font-semibold">
              Most Used Class
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 relative flex-shrink-0 bg-gray-900/50 rounded-lg p-2">
                <Image
                  src={mostUsedKit.metadata.imageUrl}
                  alt={mostUsedKit.metadata.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-lg truncate mb-1">
                  {mostUsedKit.metadata.name}
                </h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-300">
                    {formatTime(mostUsedKit.stats.timePlayed)}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className={`font-semibold ${mostUsedKit.stats.kdRatio >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                    K/D {mostUsedKit.stats.kdRatio.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

