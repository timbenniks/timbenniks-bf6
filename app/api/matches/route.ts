import { NextRequest, NextResponse } from 'next/server';
import { browserFetch } from '@/lib/browser-fetch';

const API_BASE = 'https://api.tracker.gg/api/v2/bf6/standard';
const UPDATE_HASH = '4B52B92031F7E041534F8A85C814734F';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('playerId');
    const platform = searchParams.get('platform') || 'origin';

    if (!playerId) {
      return NextResponse.json(
        { error: 'playerId is required' },
        { status: 400 }
      );
    }

    // Map xbl to xbox for matches endpoint
    const platformEndpoint = platform === 'xbl' ? 'xbox' : platform;
    const url = `${API_BASE}/matches/${platformEndpoint}/${playerId}?updateHash=${UPDATE_HASH}`;

    // Forward browser headers to mimic actual browser request
    // Don't set Accept-Encoding - let Node.js handle compression
    const headers: HeadersInit = {
      'Accept': request.headers.get('Accept') || 'application/json, text/plain, */*',
      'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.9',
      'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Referer': 'https://tracker.gg/',
      'Origin': 'https://tracker.gg',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    // Forward cookies if present - these are critical for Cloudflare
    const cookie = request.headers.get('Cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    
    // Also try to get cookies from query param if client sends them
    const cookieParam = searchParams.get('_cf_bm_token');
    if (cookieParam && cookie) {
      headers['Cookie'] = `${cookie}; _cf_bm_token=${cookieParam}`;
    }

    // Use browser-based fetch to bypass Cloudflare bot protection
    // This uses Playwright with a real browser, making requests look like actual browser requests
    const response = await browserFetch(url, {
      method: 'GET',
      headers: headers as Record<string, string>,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch matches: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

