"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { MatchData } from "@/lib/api";
import StatCard from "./StatCard";

interface MatchesDashboardProps {
  data: MatchData;
}

export default function MatchesDashboard({ data }: MatchesDashboardProps) {
  // Use the LAST match which contains cumulative totals across all matches
  // The matches array contains delta snapshots, with the last one having the most complete cumulative data
  // Handle both API response structures:
  // - Without hash: { data: { matches: [...] } } - wrapped in 'data' property
  // - With hash: { matches: [...] } - no 'data' wrapper, properties at root level
  const matches = (data.data?.matches ||
    (data as any).matches ||
    []) as typeof data.data.matches;
  const lastMatchIndex = matches.length > 0 ? matches.length - 1 : 0;
  const firstMatchIndex = 0;

  // Get both first and last match segments
  const firstMatchSegment = matches[firstMatchIndex]?.segments?.find(
    (s) => s.type === "overview"
  );
  const lastMatchSegment = matches[lastMatchIndex]?.segments?.find(
    (s) => s.type === "overview"
  );

  // Use the LAST match for cumulative stats (most complete cumulative data)
  // Delta snapshots: the last match typically has the most complete cumulative totals
  // Fallback to first match if last doesn't exist
  const overviewSegment = lastMatchSegment || firstMatchSegment;

  if (!overviewSegment) {
    return (
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
        <p className="text-gray-400">No match data available</p>
      </div>
    );
  }

  // Get stats from overview segment
  const stats = overviewSegment.stats || {};

  // Get current rank from the most recent match (first match)
  const playerRank =
    firstMatchSegment?.stats?.careerPlayerRank?.value ||
    stats.careerPlayerRank?.value ||
    0;
  const rankImage =
    firstMatchSegment?.stats?.careerPlayerRank?.metadata?.imageUrl ||
    stats.careerPlayerRank?.metadata?.imageUrl;

  // Helper function to get display value or fallback to value as string
  const getStatValue = (statKey: string): string => {
    const stat = stats[statKey];
    if (!stat) return "0";
    // Try displayValue first, then value, then default to "0"
    if (stat.displayValue !== undefined && stat.displayValue !== null) {
      return String(stat.displayValue);
    }
    if (stat.value !== undefined && stat.value !== null) {
      return String(stat.value);
    }
    return "0";
  };
  // Get metadata from overview segment, with fallback to firstMatchSegment if needed
  const metadata =
    overviewSegment.metadata || firstMatchSegment?.metadata || {};
  const gamemodes = metadata.gamemodes || [];
  const kits = metadata.kits || [];
  const weapons = metadata.weapons || [];
  const levels = metadata.levels || [];
  const vehicles = metadata.vehicles || [];
  const gadgets = metadata.gadgets || [];

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate overall stats - find the highest cumulative values across all matches
  // Delta snapshots may reset stats, so we need to find the match with highest cumulative totals
  const lastMatchStats = lastMatchSegment?.stats || {};
  const firstMatchStats = firstMatchSegment?.stats || {};

  let maxMatches = 0;
  let maxWins = 0;
  let maxLosses = 0;
  let maxKills = 0;
  let maxDeaths = 0;
  let maxTimePlayed = 0;

  // Iterate through all matches to find maximum cumulative values
  matches.forEach((match) => {
    const segment = match?.segments?.find((s) => s.type === "overview");
    if (segment?.stats) {
      const matchStats = segment.stats;
      if (
        matchStats.matchesPlayed?.value &&
        matchStats.matchesPlayed.value > maxMatches
      ) {
        maxMatches = matchStats.matchesPlayed.value;
      }
      if (
        matchStats.matchesWon?.value &&
        matchStats.matchesWon.value > maxWins
      ) {
        maxWins = matchStats.matchesWon.value;
      }
      if (
        matchStats.matchesLost?.value &&
        matchStats.matchesLost.value > maxLosses
      ) {
        maxLosses = matchStats.matchesLost.value;
      }
      if (matchStats.kills?.value && matchStats.kills.value > maxKills) {
        maxKills = matchStats.kills.value;
      }
      if (matchStats.deaths?.value && matchStats.deaths.value > maxDeaths) {
        maxDeaths = matchStats.deaths.value;
      }
      if (
        matchStats.timePlayed?.value &&
        matchStats.timePlayed.value > maxTimePlayed
      ) {
        maxTimePlayed = matchStats.timePlayed.value;
      }
    }
  });

  // Use maximum values found, with fallbacks to first/last match if needed
  const totalMatches =
    maxMatches ||
    (firstMatchStats.matchesPlayed?.value ??
      lastMatchStats.matchesPlayed?.value ??
      stats.matchesPlayed?.value ??
      0);
  const totalWins =
    maxWins ||
    (firstMatchStats.matchesWon?.value ??
      lastMatchStats.matchesWon?.value ??
      stats.matchesWon?.value ??
      0);
  const totalLosses =
    maxLosses ||
    (firstMatchStats.matchesLost?.value ??
      lastMatchStats.matchesLost?.value ??
      stats.matchesLost?.value ??
      0);
  const totalKills =
    maxKills ||
    (lastMatchStats.kills?.value ??
      stats.kills?.value ??
      firstMatchStats.kills?.value ??
      0);
  const totalDeaths =
    maxDeaths ||
    (lastMatchStats.deaths?.value ??
      stats.deaths?.value ??
      firstMatchStats.deaths?.value ??
      0);
  const totalTimePlayed =
    maxTimePlayed ||
    (lastMatchStats.timePlayed?.value ??
      firstMatchStats.timePlayed?.value ??
      stats.timePlayed?.value ??
      0);
  const overallKD = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
  const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

  // Sort weapons by kills
  const topWeapons = [...weapons]
    .filter((w) => w.stats.kills > 0)
    .sort((a, b) => b.stats.kills - a.stats.kills)
    .slice(0, 10);

  // Sort maps by time played
  const topMaps = [...levels]
    .filter((l) => l.stats.timePlayed > 0)
    .sort((a, b) => b.stats.timePlayed - a.stats.timePlayed)
    .slice(0, 6);

  // Sort vehicles by time played
  const topVehicles = [...vehicles]
    .filter((v) => v.stats.timePlayed > 0)
    .sort((a, b) => b.stats.timePlayed - a.stats.timePlayed)
    .slice(0, 5);

  // Sort gadgets by uses
  const topGadgets = [...gadgets]
    .filter((g) => g.stats.uses > 0)
    .sort((a, b) => b.stats.uses - a.stats.uses)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Matches"
          value={totalMatches}
          subtitle={`${totalWins} wins / ${totalLosses} losses`}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          subtitle={`${formatTime(totalTimePlayed)} played`}
          trend={winRate >= 50 ? "up" : "down"}
        />
        <StatCard
          title="K/D Ratio"
          value={overallKD.toFixed(2)}
          subtitle={`${totalKills} kills / ${totalDeaths} deaths`}
          trend={overallKD >= 1 ? "up" : "down"}
        />
        <StatCard
          title="KDA Ratio"
          value={stats.kdaRatio?.displayValue || "0.00"}
          subtitle={`${stats.assists?.displayValue || 0} assists`}
        />
      </div>

      {/* Extended Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Score"
          value={getStatValue("score")}
          subtitle={`${getStatValue("scorePerMinute")}/min`}
        />
        <StatCard
          title="Damage Dealt"
          value={getStatValue("damageDealt")}
          subtitle={`${getStatValue("damagePerMinute")}/min`}
        />
        <StatCard
          title="Headshots"
          value={getStatValue("headshotKills")}
          subtitle={`${getStatValue("headshotPercentage")}% HS%`}
        />
        <StatCard
          title="Revives"
          value={getStatValue("revives")}
          subtitle="Team support"
        />
        <StatCard
          title="Assists"
          value={getStatValue("assists")}
          subtitle="Team play"
        />
        <StatCard
          title="Multi Kills"
          value={getStatValue("multiKills")}
          subtitle="Streaks"
        />
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Kills/Match"
            value={getStatValue("killsPerMatch")}
            subtitle={`${totalMatches} matches`}
          />
          <StatCard
            title="Damage/Match"
            value={getStatValue("damagePerMatch")}
            subtitle="Average damage"
          />
          <StatCard
            title="Kills/Min"
            value={getStatValue("killsPerMinute")}
            subtitle="Combat rate"
          />
          <StatCard
            title="Player Kills"
            value={getStatValue("playerKills") || getStatValue("kills")}
            subtitle="Infantry kills"
          />
          <StatCard
            title="Vehicles Destroyed"
            value={getStatValue("vehiclesDestroyed")}
            subtitle="Vehicle eliminations"
          />
          <StatCard
            title="Gadget Uses"
            value={getStatValue("gadgetUses")}
            subtitle="Total uses"
          />
        </div>
      </div>

      {/* Combat Breakdown */}
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Combat Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Weapon Kills</p>
            <p className="text-2xl font-bold text-white">
              {stats.weaponKills?.displayValue || "0"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.weaponDamageDealt?.displayValue || "0"} damage
            </p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Vehicle Kills</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.vehicleKills?.displayValue || "0"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.vehicleDamageDealt?.displayValue || "0"} damage
            </p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Gadget Kills</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.gadgetKills?.displayValue || "0"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.gadgetDamageDealt?.displayValue || "0"} damage
            </p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Melee Kills</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.meleeKills?.displayValue || "0"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Close combat</p>
          </div>
        </div>
      </div>

      {/* Shooting Stats */}
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Shooting Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Shots Fired</p>
            <p className="text-2xl font-bold text-white">
              {stats.shotsFired?.displayValue || "0"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.shotsHit?.displayValue || "0"} hits
            </p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.shotsFired?.value && stats.shotsHit?.value
                ? (
                    (stats.shotsHit.value / stats.shotsFired.value) *
                    100
                  ).toFixed(1)
                : "0"}
              %
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.shotsHit?.displayValue || "0"} /{" "}
              {stats.shotsFired?.displayValue || "0"}
            </p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">ADS Kills</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.adsKills?.displayValue || "0"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Aimed shots</p>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Hipfire Kills</p>
            <p className="text-2xl font-bold text-purple-400">
              {stats.hipfireKills?.displayValue || "0"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Close range</p>
          </div>
        </div>
      </div>

      {/* Objective Stats */}
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Objective Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Captured</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.objectivesCaptured?.displayValue || "0"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Defended</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.defendedObjectives?.displayValue || "0"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Destroyed</p>
            <p className="text-2xl font-bold text-red-400">
              {stats.objectivesDestroyed?.displayValue || "0"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Armed</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.objectivesArmed?.displayValue || "0"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Disarmed</p>
            <p className="text-2xl font-bold text-purple-400">
              {stats.objectivesDisarmed?.displayValue || "0"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Obj Time</p>
            <p className="text-xl font-bold text-white">
              {stats.objectiveTime?.displayValue || "0s"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.objectiveTimePct?.displayValue || "0%"} of total
            </p>
          </div>
        </div>
      </div>

      {/* Gamemodes */}
      {gamemodes.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Gamemode Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gamemodes.map((gamemode) => (
              <div
                key={gamemode.key}
                className="bg-gray-800/80 rounded-lg p-4 hover:bg-gray-700/60 transition-colors"
              >
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={gamemode.metadata.imageUrl}
                      alt={gamemode.metadata.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold">
                      {gamemode.metadata.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {gamemode.stats.matchesPlayed} matches •{" "}
                      {formatTime(gamemode.stats.timePlayed)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Win Rate</p>
                    <p className="text-lg font-bold text-green-400">
                      {gamemode.stats.wlPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">KPM</p>
                    <p className="text-lg font-bold text-white">
                      {gamemode.stats.killsPerMinute.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Kills/Match
                    </p>
                    <p className="text-lg font-bold text-yellow-400">
                      {gamemode.stats.killsPerMatch.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Obj Time</p>
                    <p className="text-lg font-bold text-blue-400">
                      {gamemode.stats.objectiveTimePct.toFixed(1)}%
                    </p>
                  </div>
                  {gamemode.stats.kills > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Kills</p>
                      <p className="text-lg font-bold text-white">
                        {gamemode.stats.kills}
                      </p>
                    </div>
                  )}
                  {gamemode.stats.assists > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Assists</p>
                      <p className="text-lg font-bold text-blue-400">
                        {gamemode.stats.assists}
                      </p>
                    </div>
                  )}
                  {gamemode.stats.revives > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Revives</p>
                      <p className="text-lg font-bold text-green-400">
                        {gamemode.stats.revives}
                      </p>
                    </div>
                  )}
                  {gamemode.stats.objectivesCaptured > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Obj Captured
                      </p>
                      <p className="text-lg font-bold text-purple-400">
                        {gamemode.stats.objectivesCaptured}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kits/Classes */}
      {kits.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Class Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kits
              .filter((kit) => kit.stats.timePlayed > 0)
              .sort((a, b) => b.stats.timePlayed - a.stats.timePlayed)
              .map((kit) => (
                <div
                  key={kit.key}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors text-center"
                >
                  <div className="w-20 h-20 relative mx-auto mb-3">
                    <Image
                      src={kit.metadata.imageUrl}
                      alt={kit.metadata.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h4 className="text-white font-semibold mb-2">
                    {kit.metadata.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">K/D</span>
                      <span
                        className={`font-bold ${
                          kit.stats.kdRatio >= 1
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {kit.stats.kdRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kills</span>
                      <span className="text-white font-semibold">
                        {kit.stats.kills}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deaths</span>
                      <span className="text-red-400 font-semibold">
                        {kit.stats.deaths || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assists</span>
                      <span className="text-blue-400 font-semibold">
                        {kit.stats.assists || 0}
                      </span>
                    </div>
                    {kit.stats.kdaRatio > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">KDA</span>
                        <span className="text-purple-400 font-semibold">
                          {kit.stats.kdaRatio.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time</span>
                      <span className="text-gray-300">
                        {formatTime(kit.stats.timePlayed)}
                      </span>
                    </div>
                    {kit.stats.deployments > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deployments</span>
                        <span className="text-yellow-400">
                          {kit.stats.deployments}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Weapons */}
      {topWeapons.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Weapons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topWeapons.map((weapon, index) => (
              <div
                key={weapon.key}
                className="bg-gray-800/80 rounded-lg p-4 hover:bg-gray-700/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-bold text-sm">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    {weapon.metadata.categoryName}
                  </span>
                </div>
                <div className="w-full h-24 relative mb-3 bg-gray-900/30 rounded">
                  <Image
                    src={weapon.metadata.imageUrl}
                    alt={weapon.metadata.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <h4 className="text-white font-semibold text-sm mb-2 truncate">
                  {weapon.metadata.name}
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kills</span>
                    <span className="text-white font-bold">
                      {weapon.stats.kills}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-green-400">
                      {(
                        weapon.stats.accuracy ||
                        weapon.stats.shotsAccuracy ||
                        0
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Headshots</span>
                    <span className="text-yellow-400">
                      {(weapon.stats.headshotPercentage || 0).toFixed(0)}%
                    </span>
                  </div>
                  {weapon.stats.damageDealt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Damage</span>
                      <span className="text-red-400">
                        {weapon.stats.damageDealt.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {weapon.stats.shotsFired && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shots</span>
                      <span className="text-gray-300">
                        {weapon.stats.shotsFired.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {weapon.stats.killsPerMinute > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">KPM</span>
                      <span className="text-blue-400">
                        {weapon.stats.killsPerMinute.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {weapon.stats.multiKills > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Multi Kills</span>
                      <span className="text-purple-400">
                        {weapon.stats.multiKills}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maps */}
      {topMaps.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Map Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMaps.map((level) => (
              <div
                key={level.key}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
              >
                <div className="relative w-full h-32">
                  <Image
                    src={level.metadata.imageUrl}
                    alt={level.metadata.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <h4 className="text-white font-semibold text-sm">
                      {level.metadata.name}
                    </h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Matches</p>
                      <p className="text-white font-bold">
                        {level.stats.matchesPlayed}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Win Rate
                      </p>
                      <p className="text-green-400 font-bold">
                        {level.stats.wlPercentage.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Time</p>
                      <p className="text-gray-300 font-bold">
                        {formatTime(level.stats.timePlayed)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deployment Stats, Vehicle Assists, and Multi-Kill Breakdown in 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deployment Stats */}
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Deployment Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-300 mb-1">Total Deployments</p>
              <p className="text-2xl font-bold text-white">
                {stats.deployments?.displayValue || "0"}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-300 mb-1">Class Deployments</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.kitDeployments?.displayValue || "0"}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-300 mb-1">Vehicle Deployments</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.vehicleDeployments?.displayValue || "0"}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-300 mb-1">Vehicle Time</p>
              <p className="text-xl font-bold text-yellow-400">
                {stats.vehicleTimePlayed?.displayValue || "0s"}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Assists */}
        {(stats.vehicleAssists?.value ||
          stats.passengerAssists?.value ||
          stats.driverAssists?.value) && (
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Vehicle Assists
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">
                  Total Vehicle Assists
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.vehicleAssists?.displayValue || "0"}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Passenger Assists</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.passengerAssists?.displayValue || "0"}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Driver Assists</p>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.driverAssists?.displayValue || "0"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Kill Breakdown */}
        {(stats.weaponMultiKills?.value ||
          stats.vehicleMultiKills?.value ||
          stats.gadgetMultiKills?.value) && (
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Multi-Kill Breakdown
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Weapon Multi-Kills</p>
                <p className="text-2xl font-bold text-white">
                  {stats.weaponMultiKills?.displayValue || "0"}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">
                  Vehicle Multi-Kills
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.vehicleMultiKills?.displayValue || "0"}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Gadget Multi-Kills</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.gadgetMultiKills?.displayValue || "0"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Combat Stats */}
      {(stats.roadKills?.value || stats.vehicleCallIns?.value) && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Vehicle Combat Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.roadKills?.value > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Road Kills</p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.roadKills?.displayValue || "0"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Run over kills</p>
              </div>
            )}
            {stats.vehicleCallIns?.value > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Vehicle Call-ins</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.vehicleCallIns?.displayValue || "0"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Vehicles called</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Objective Stats */}
      {(stats.intelPickedUp?.value || stats.defendedSectors?.value) && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Additional Objective Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.intelPickedUp?.value > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Intel Picked Up</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.intelPickedUp?.displayValue || "0"}
                </p>
              </div>
            )}
            {stats.defendedSectors?.value > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Defended Sectors</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.defendedSectors?.displayValue || "0"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicles and Gadgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles */}
        {topVehicles.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Vehicle Usage
            </h3>
            <div className="space-y-3">
              {topVehicles.map((vehicle) => (
                <div
                  key={vehicle.key}
                  className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {vehicle.metadata.imageUrl && (
                      <div className="w-16 h-16 relative flex-shrink-0 bg-gray-900/30 rounded">
                        <Image
                          src={vehicle.metadata.imageUrl}
                          alt={vehicle.metadata.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">
                        {vehicle.metadata.name}
                      </h4>
                      {vehicle.metadata.categoryName && (
                        <p className="text-xs text-gray-500">
                          {vehicle.metadata.categoryName}
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-gray-400">Kills</span>
                          <p className="text-white font-bold">
                            {vehicle.stats.kills || 0}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Time</span>
                          <p className="text-gray-300">
                            {formatTime(vehicle.stats.timePlayed)}
                          </p>
                        </div>
                        {vehicle.stats.damageDealt && (
                          <div>
                            <span className="text-gray-400">Damage</span>
                            <p className="text-red-400">
                              {vehicle.stats.damageDealt.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {vehicle.stats.roadKills > 0 && (
                          <div>
                            <span className="text-gray-400">Road Kills</span>
                            <p className="text-orange-400 font-bold">
                              {vehicle.stats.roadKills}
                            </p>
                          </div>
                        )}
                        {vehicle.stats.distanceTraveled > 0 && (
                          <div>
                            <span className="text-gray-400">Distance</span>
                            <p className="text-blue-400">
                              {vehicle.stats.distanceTraveled.toLocaleString()}m
                            </p>
                          </div>
                        )}
                        {vehicle.stats.callIns > 0 && (
                          <div>
                            <span className="text-gray-400">Call-ins</span>
                            <p className="text-yellow-400">
                              {vehicle.stats.callIns}
                            </p>
                          </div>
                        )}
                        {vehicle.stats.assists > 0 && (
                          <div>
                            <span className="text-gray-400">Assists</span>
                            <p className="text-green-400">
                              {vehicle.stats.assists}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gadgets */}
        {topGadgets.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Gadget Usage
            </h3>
            <div className="space-y-3">
              {topGadgets.map((gadget) => (
                <div
                  key={gadget.key}
                  className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 relative flex-shrink-0 bg-gray-900/30 rounded">
                      <Image
                        src={gadget.metadata.imageUrl}
                        alt={gadget.metadata.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">
                        {gadget.metadata.name}
                      </h4>
                      {gadget.metadata.categoryName && (
                        <p className="text-xs text-gray-500">
                          {gadget.metadata.categoryName}
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-gray-400">Uses</span>
                          <p className="text-white font-bold">
                            {gadget.stats.uses || 0}
                          </p>
                        </div>
                        {gadget.stats.kills > 0 && (
                          <div>
                            <span className="text-gray-400">Kills</span>
                            <p className="text-red-400 font-bold">
                              {gadget.stats.kills}
                            </p>
                          </div>
                        )}
                        {gadget.stats.repairs > 0 && (
                          <div>
                            <span className="text-gray-400">Repairs</span>
                            <p className="text-blue-400 font-bold">
                              {gadget.stats.repairs}
                            </p>
                          </div>
                        )}
                        {gadget.stats.vehiclesDestroyed > 0 && (
                          <div>
                            <span className="text-gray-400">
                              Vehicles Destroyed
                            </span>
                            <p className="text-orange-400 font-bold">
                              {gadget.stats.vehiclesDestroyed}
                            </p>
                          </div>
                        )}
                        {gadget.stats.deployments > 0 && (
                          <div>
                            <span className="text-gray-400">Deployments</span>
                            <p className="text-purple-400">
                              {gadget.stats.deployments}
                            </p>
                          </div>
                        )}
                        {gadget.stats.damageDealt > 0 && (
                          <div>
                            <span className="text-gray-400">Damage</span>
                            <p className="text-yellow-400">
                              {gadget.stats.damageDealt.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {gadget.stats.timePlayed > 0 && (
                          <div>
                            <span className="text-gray-400">Time</span>
                            <p className="text-gray-300">
                              {formatTime(gadget.stats.timePlayed)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kill Type Breakdown */}
      {(stats.headshotKills?.value || stats.bodyKills?.value) && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Kill Type Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/80 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Headshot Kills</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.headshotKills?.displayValue || "0"}
                </p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.headshotKills?.value && totalKills > 0
                        ? (stats.headshotKills.value / totalKills) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats.headshotKills?.value && totalKills > 0
                  ? ((stats.headshotKills.value / totalKills) * 100).toFixed(1)
                  : 0}
                % of total kills
              </p>
            </div>
            <div className="bg-gray-800/80 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Body Kills</p>
                <p className="text-2xl font-bold text-white">
                  {stats.bodyKills?.displayValue || "0"}
                </p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{
                    width: `${
                      stats.bodyKills?.value && totalKills > 0
                        ? (stats.bodyKills.value / totalKills) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats.bodyKills?.value && totalKills > 0
                  ? ((stats.bodyKills.value / totalKills) * 100).toFixed(1)
                  : 0}
                % of total kills
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weapon Categories */}
      {weapons.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Weapon Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(
              weapons.reduce((acc, weapon) => {
                const category = weapon.metadata.categoryName || "Other";
                if (!acc[category]) {
                  acc[category] = { kills: 0, count: 0 };
                }
                acc[category].kills += weapon.stats.kills;
                acc[category].count += 1;
                return acc;
              }, {} as Record<string, { kills: number; count: number }>)
            )
              .sort(([, a], [, b]) => b.kills - a.kills)
              .map(([category, data]) => (
                <div
                  key={category}
                  className="bg-gray-800 rounded-lg p-4 text-center"
                >
                  <p className="text-xs text-gray-400 mb-1 truncate">
                    {category}
                  </p>
                  <p className="text-xl font-bold text-white">{data.kills}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {data.count} weapons
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
