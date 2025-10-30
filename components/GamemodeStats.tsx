'use client';

import Image from 'next/image';

interface Gamemode {
  key: string;
  metadata: {
    name: string;
    imageUrl: string;
  };
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    timePlayed: number;
    kills: number;
    assists: number;
    revives: number;
    killsPerMinute: number;
    killsPerMatch: number;
    wlPercentage: number;
    objectiveTimePct: number;
  };
}

interface GamemodeStatsProps {
  gamemodes: Gamemode[];
}

export default function GamemodeStats({ gamemodes }: GamemodeStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Gamemode Performance</h3>
      <div className="space-y-4">
        {gamemodes.map((gamemode) => (
          <div key={gamemode.key} className="bg-gray-800/80  rounded-lg p-4 hover:bg-gray-700/30 transition-colors">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 relative">
                <Image
                  src={gamemode.metadata.imageUrl}
                  alt={gamemode.metadata.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="text-white font-semibold">{gamemode.metadata.name}</h4>
                <p className="text-sm text-gray-400">
                  {gamemode.stats.matchesPlayed} matches • {formatTime(gamemode.stats.timePlayed)} played
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Win Rate</p>
                <p className="text-lg font-bold text-green-400">{gamemode.stats.wlPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Kills</p>
                <p className="text-lg font-bold text-white">{gamemode.stats.kills}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Kills/Match</p>
                <p className="text-lg font-bold text-white">{gamemode.stats.killsPerMatch.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Objective Time</p>
                <p className="text-lg font-bold text-blue-400">{gamemode.stats.objectiveTimePct.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

