'use client';

import Image from 'next/image';

interface Weapon {
  key: string;
  metadata: {
    name: string;
    imageUrl: string;
  };
  stats: {
    kills: number;
    headshots: number;
    accuracy: number;
    killsPerMinute: number;
  };
}

interface WeaponStatsProps {
  weapons: Weapon[];
}

export default function WeaponStats({ weapons }: WeaponStatsProps) {
  // Sort by kills (most used first)
  const sortedWeapons = [...weapons].sort((a, b) => b.stats.kills - a.stats.kills).slice(0, 10);

  return (
    <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Top Weapons</h3>
      <div className="space-y-3">
        {sortedWeapons.map((weapon, index) => (
          <div 
            key={weapon.key} 
            className="bg-gray-800/80  rounded-lg p-4 hover:bg-gray-700/30 transition-colors flex items-center space-x-4"
          >
            <div className="text-gray-500 font-bold text-lg w-8">{index + 1}</div>
            <div className="w-12 h-12 relative flex-shrink-0">
              <Image
                src={weapon.metadata.imageUrl}
                alt={weapon.metadata.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold truncate">{weapon.metadata.name}</h4>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-400">{weapon.stats.kills} kills</span>
                <span className="text-sm text-gray-400">{weapon.stats.headshots} HS</span>
                <span className="text-sm text-gray-400">{weapon.stats.accuracy.toFixed(1)}% acc</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{weapon.stats.killsPerMinute.toFixed(2)}</p>
              <p className="text-xs text-gray-500">KPM</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

