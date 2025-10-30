// API endpoints configuration - using Next.js API routes to avoid CORS issues
const API_BASE = '/api';
// Default player ID - used as fallback if no playerId is provided
const DEFAULT_PLAYER_ID = '1009202439087';

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
  const response = await fetch(
    `${API_BASE}/matches?playerId=${id}&platform=${platform}`,
    {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to fetch matches: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchProfile(playerId?: string, platform: string = 'origin'): Promise<ProfileData> {
  const id = playerId || DEFAULT_PLAYER_ID;
  const response = await fetch(
    `${API_BASE}/profile?playerId=${id}&platform=${platform}`,
    {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to fetch profile: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchWLPercentage(playerId?: string, platform: string = 'origin'): Promise<WLPercentageData> {
  const id = playerId || DEFAULT_PLAYER_ID;
  const response = await fetch(
    `${API_BASE}/wlpercentage?playerId=${id}&platform=${platform}`,
    {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to fetch win/loss percentage: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchKDRatio(playerId?: string, platform: string = 'origin'): Promise<KDRatioData> {
  const id = playerId || DEFAULT_PLAYER_ID;
  const response = await fetch(
    `${API_BASE}/kdratio?playerId=${id}&platform=${platform}`,
    {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to fetch K/D ratio: ${response.statusText}`);
  }

  return response.json();
}

