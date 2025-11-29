// API endpoints configuration - direct client-side calls to tracker.gg API
const API_BASE = 'https://api.tracker.gg/api/v2/bf6/standard';
const UPDATE_HASH = '4B52B92031F7E041534F8A85C814734F';
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

// Client-side API functions - direct calls to tracker.gg API
export async function fetchMatches(playerId?: string, platform: string = 'origin'): Promise<MatchData> {
  const id = playerId || DEFAULT_PLAYER_ID;

  // Map xbl to xbox for matches endpoint
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform;
  const url = `${API_BASE}/matches/${platformEndpoint}/${id}?updateHash=${UPDATE_HASH}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Include cookies in the request
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://tracker.gg/',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  }).catch((fetchError) => {
    // Handle network errors (CORS, network failures, etc.)
    throw new Error(`Network error: ${fetchError.message}. This may be a CORS issue. Make sure you're accessing from a browser with cookies enabled.`);
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // If not JSON, use the text or status text
      if (errorText && errorText !== response.statusText) {
        errorMessage = errorText;
      }
    }
    throw new Error(`Failed to fetch matches: ${errorMessage}`);
  }

  return response.json();
}

export async function fetchProfile(playerId?: string, platform: string = 'origin'): Promise<ProfileData> {
  const id = playerId || DEFAULT_PLAYER_ID;

  // Map platform slug to API endpoint format
  // xbl -> xbox, psn -> psn, steam -> steam, origin -> ign
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform === 'psn' ? 'psn' : platform === 'steam' ? 'steam' : 'ign';
  const url = `${API_BASE}/profile/${platformEndpoint}/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Include cookies in the request
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://tracker.gg/',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  }).catch((fetchError) => {
    // Handle network errors (CORS, network failures, etc.)
    throw new Error(`Network error: ${fetchError.message}. This may be a CORS issue. Make sure you're accessing from a browser with cookies enabled.`);
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // If not JSON, use the text or status text
      if (errorText && errorText !== response.statusText) {
        errorMessage = errorText;
      }
    }
    throw new Error(`Failed to fetch profile: ${errorMessage}`);
  }

  return response.json();
}

export async function fetchWLPercentage(playerId?: string, platform: string = 'origin'): Promise<WLPercentageData> {
  const id = playerId || DEFAULT_PLAYER_ID;

  // Map xbl to xbox for stats endpoints
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform;
  const url = `${API_BASE}/profile/${platformEndpoint}/${id}/stats/overview/wlPercentage`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Include cookies in the request
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://tracker.gg/',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  }).catch((fetchError) => {
    // Handle network errors (CORS, network failures, etc.)
    throw new Error(`Network error: ${fetchError.message}. This may be a CORS issue. Make sure you're accessing from a browser with cookies enabled.`);
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // If not JSON, use the text or status text
      if (errorText && errorText !== response.statusText) {
        errorMessage = errorText;
      }
    }
    throw new Error(`Failed to fetch win/loss percentage: ${errorMessage}`);
  }

  return response.json();
}

export async function fetchKDRatio(playerId?: string, platform: string = 'origin'): Promise<KDRatioData> {
  const id = playerId || DEFAULT_PLAYER_ID;

  // Map xbl to xbox for stats endpoints
  const platformEndpoint = platform === 'xbl' ? 'xbox' : platform;
  const url = `${API_BASE}/profile/${platformEndpoint}/${id}/stats/overview/kdRatio`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Include cookies in the request
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://tracker.gg/',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  }).catch((fetchError) => {
    // Handle network errors (CORS, network failures, etc.)
    throw new Error(`Network error: ${fetchError.message}. This may be a CORS issue. Make sure you're accessing from a browser with cookies enabled.`);
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // If not JSON, use the text or status text
      if (errorText && errorText !== response.statusText) {
        errorMessage = errorText;
      }
    }
    throw new Error(`Failed to fetch K/D ratio: ${errorMessage}`);
  }

  return response.json();
}

