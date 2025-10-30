'use client';

import Image from 'next/image';

interface Kit {
  key: string;
  metadata: {
    name: string;
    imageUrl: string;
  };
  stats: {
    timePlayed: number;
    kills: number;
    deaths: number;
    kdRatio: number;
    killsPerMinute: number;
  };
}

interface KitStatsProps {
  kits: Kit[];
}

export default function KitStats({ kits }: KitStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Sort by time played (most used first)
  const sortedKits = [...kits].sort((a, b) => b.stats.timePlayed - a.stats.timePlayed);

  return (
    <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Class Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedKits.map((kit) => (
          <div key={kit.key} className="bg-gray-800/80  rounded-lg p-4 hover:bg-gray-700/30 transition-colors">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-16 h-16 relative">
                <Image
                  src={kit.metadata.imageUrl}
                  alt={kit.metadata.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{kit.metadata.name}</h4>
                <p className="text-sm text-gray-400">{formatTime(kit.stats.timePlayed)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">K/D</p>
                <p className={`text-lg font-bold ${kit.stats.kdRatio >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {kit.stats.kdRatio.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Kills</p>
                <p className="text-lg font-bold text-white">{kit.stats.kills}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">KPM</p>
                <p className="text-lg font-bold text-white">{kit.stats.killsPerMinute.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

