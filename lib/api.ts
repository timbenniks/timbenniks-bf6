// API endpoints configuration
const API_BASE = 'https://api.tracker.gg/api/v2/bf6/standard';
// Default player ID - used as fallback if no playerId is provided
const DEFAULT_PLAYER_ID = '1009202439087';
// The updateHash parameter enables additional data in the response:
// - More comprehensive stats objects with displayName, displayCategory, category fields
// - Multiple match snapshots (deltas) showing progression over time
// - Additional metadata like expiryDate and streams
const UPDATE_HASH = '4B52B92031F7E041534F8A85C814734F';

export interface KDRatioData {
  data: {
    history: {
      metadata: {
        key: string;
        name: string;
        description: string | null;
      };
      data: Array<[string, {
        metadata: Record<string, unknown>;
        value: number;
        displayValue: string;
        displayType: string;
      }]>;
    };
    leaderboard: {
      entries: Array<{
        platformInfo: {
          platformUserHandle: string;
        };
        value: {
          value: number;
          displayValue: string;
        };
        rank: {
          value: number;
        };
      }>;
    };
  };
}

export interface WLPercentageData {
  data: {
    history: {
      metadata: {
        key: string;
        name: string;
        description: string | null;
      };
      data: Array<[string, {
        metadata: Record<string, unknown>;
        value: number;
        displayValue: string;
        displayType: string;
      }]>;
    };
    leaderboard: {
      entries: Array<{
        platformInfo: {
          platformUserHandle: string;
        };
        value: {
          value: number;
          displayValue: string;
        };
        rank: {
          value: number;
        };
      }>;
    };
  };
}

export interface MatchData {
  data: {
    matches: Array<{
      attributes: {
        type: string;
        id: string;
      };
      metadata: {
        timestamp: string;
      };
      segments: Array<{
        type: string;
        metadata?: {
          gamemodes?: Array<{
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
              objectivesCaptured?: number;
            };
          }>;
          kits?: Array<{
            key: string;
            metadata: {
              name: string;
              imageUrl: string;
            };
            stats: {
              timePlayed: number;
              kills: number;
              deaths: number;
              assists?: number;
              kdRatio: number;
              kdaRatio?: number;
              killsPerMinute: number;
              deployments?: number;
            };
          }>;
          weapons?: Array<{
            key: string;
            metadata: {
              name: string;
              imageUrl: string;
              category?: string;
              categoryName?: string;
            };
            stats: {
              kills: number;
              headshots?: number;
              headshotKills?: number;
              accuracy?: number;
              shotsAccuracy?: number;
              headshotPercentage?: number;
              killsPerMinute: number;
              damageDealt?: number;
              shotsFired?: number;
              shotsHit?: number;
              multiKills?: number;
            };
          }>;
          levels?: Array<{
            key: string;
            metadata: {
              name: string;
              imageUrl: string;
            };
            stats: {
              timePlayed: number;
              matchesPlayed: number;
              matchesWon: number;
              matchesLost: number;
              wlPercentage: number;
            };
          }>;
          vehicles?: Array<{
            key: string;
            metadata: {
              name: string;
              imageUrl: string | null;
              category?: string;
              categoryName?: string;
            };
            stats: {
              timePlayed: number;
              kills: number;
              assists?: number;
              damageDealt?: number;
              deployments?: number;
              roadKills?: number;
              distanceTraveled?: number;
              callIns?: number;
            };
          }>;
          gadgets?: Array<{
            key: string;
            metadata: {
              name: string;
              imageUrl: string;
              categoryName?: string;
            };
            stats: {
              uses: number;
              kills?: number;
              repairs?: number;
              timePlayed?: number;
              damageDealt?: number;
              vehiclesDestroyed?: number;
              deployments?: number;
            };
          }>;
        };
        stats?: {
          matchesPlayed?: {
            value: number;
            displayValue: string;
          };
          matchesWon?: {
            value: number;
            displayValue: string;
          };
          matchesLost?: {
            value: number;
            displayValue: string;
          };
          kills?: {
            value: number;
            displayValue: string;
          };
          deaths?: {
            value: number;
            displayValue: string;
          };
          timePlayed?: {
            value: number;
            displayValue: string;
          };
          score?: {
            value: number;
            displayValue: string;
          };
          scorePerMinute?: {
            value: number;
            displayValue: string;
          };
          careerPlayerRank?: {
            value: number;
            displayValue: string;
            metadata?: {
              imageUrl?: string;
              delta?: number;
            };
          };
          [key: string]: any;
        };
      }>;
    }>;
  };
}


export interface ProfileData {
  data: {
    platformInfo: {
      platformUserHandle: string;
      avatarUrl: string | null;
    };
    userInfo: {
      userId: string | null;
      isPremium: boolean;
    };
  };
}

// Client-side API functions
export async function fetchMatches(playerId?: string, platform: string = 'origin'): Promise<MatchData> {
  const id = playerId || DEFAULT_PLAYER_ID;
  // Map xbl to xbox for matches endpoint
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform;
  const response = await fetch(
    `${API_BASE}/matches/${platformEndpoint}/${id}?updateHash=${UPDATE_HASH}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchProfile(playerId?: string, platform: string = 'origin'): Promise<ProfileData> {
  const id = playerId || DEFAULT_PLAYER_ID;
  // Map platform slug to API endpoint format
  // xbl -> xbox, psn -> psn, steam -> steam, origin -> ign
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform === 'psn' ? 'psn' : platform === 'steam' ? 'steam' : 'ign';
  const response = await fetch(
    `${API_BASE}/profile/${platformEndpoint}/${id}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchWLPercentage(playerId?: string, platform: string = 'origin'): Promise<WLPercentageData> {
  const id = playerId || DEFAULT_PLAYER_ID;
  // Map xbl to xbox for stats endpoints
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform;
  const response = await fetch(
    `${API_BASE}/profile/${platformEndpoint}/${id}/stats/overview/wlPercentage`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch win/loss percentage: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchKDRatio(playerId?: string, platform: string = 'origin'): Promise<KDRatioData> {
  const id = playerId || DEFAULT_PLAYER_ID;
  // Map xbl to xbox for stats endpoints
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform;
  const response = await fetch(
    `${API_BASE}/profile/${platformEndpoint}/${id}/stats/overview/kdRatio`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch K/D ratio: ${response.statusText}`);
  }

  return response.json();
}

