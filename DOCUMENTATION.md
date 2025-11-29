# Battlefield 6 Stats Dashboard - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Key Components](#key-components)
5. [API Architecture](#api-architecture)
6. [Data Flow](#data-flow)
7. [Configuration](#configuration)
8. [Dependencies](#dependencies)
9. [Environment Variables](#environment-variables)
10. [Platform Support](#platform-support)
11. [Common Issues & Solutions](#common-issues--solutions)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)

---

## Project Overview

**Battlefield 6 Stats Dashboard** is a Next.js web application that displays comprehensive gameplay statistics for Battlefield 6 players. The application fetches data from Tracker.gg's API and presents it in an interactive, visually appealing dashboard.

### Key Features

- 📊 **Real-time Statistics**: K/D ratio, win rate, total matches, and more
- 📈 **Historical Charts**: Track performance over time with interactive line charts
- 🎮 **Gamemode Analysis**: Detailed stats for each game mode (Conquest, Breakthrough, etc.)
- 🎯 **Class Performance**: See how you perform with each class (Assault, Engineer, etc.)
- 🔫 **Weapon Stats**: Top weapons ranked by kills, accuracy, and more
- 🏆 **Leaderboard Comparison**: See how you rank against other players
- 🔍 **Player Search**: Search for players across multiple platforms (EA/Origin, PSN, Xbox, Steam)

---

## Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.12
- **Icons**: React Icons 5.5
- **Runtime**: Node.js (via Next.js)

### Design Patterns

- **Client-Side Rendering**: Main dashboard uses `"use client"` for interactivity
- **Client-Side API Calls**: All API calls are made directly from the browser to Tracker.gg API
- **Component-Based Architecture**: Reusable React components
- **State Management**: React hooks (useState, useEffect)
- **URL State Management**: Query parameters for player selection

---

## Project Structure

```
timbenniks-bf6/
├── app/
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout component
│   └── page.tsx                      # Main dashboard page
├── components/                       # React components
│   ├── GamemodeStats.tsx            # Gamemode performance display
│   ├── HistoryChart.tsx             # Reusable chart component
│   ├── KDRatioDashboard.tsx         # K/D ratio dashboard
│   ├── KitStats.tsx                 # Class/kit statistics
│   ├── MatchesDashboard.tsx         # Match performance dashboard
│   ├── PlayerOverview.tsx           # Player summary card
│   ├── PlayerSearch.tsx             # Player search component
│   ├── StatCard.tsx                 # Reusable stat card
│   ├── WeaponStats.tsx              # Weapon statistics
│   └── WLPercentageDashboard.tsx    # Win/Loss dashboard
├── lib/
│   └── api.ts                       # Client-side API functions
├── data/                            # JSON data files (if any)
├── public/                          # Static assets
├── next.config.mjs                  # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── vercel.json                      # Vercel deployment config
└── package.json                     # Dependencies and scripts
```

---

## Key Components

### 1. Main Dashboard (`app/page.tsx`)

**Purpose**: Main entry point that orchestrates the entire dashboard experience.

**Key Features**:

- Player search integration
- Tab-based navigation (Matches, K/D Ratio, Win/Loss)
- Data loading and error handling
- localStorage persistence for player selection
- URL query parameter management

**State Management**:

- `loading`: Loading state for data fetching
- `error`: Error state for API failures
- `kdRatio`, `wlPercentage`, `matches`, `profile`: Data states
- `activeTab`: Current tab selection
- `hasPlayerId`: Whether a player is selected

**Key Logic**:

- Loads playerId from URL query params or localStorage
- Fetches all data in parallel using `Promise.all`
- Handles both URL-based and localStorage-based player persistence
- Suspense boundaries for async operations

### 2. Player Search (`components/PlayerSearch.tsx`)

**Purpose**: Search and select players across multiple platforms.

**Features**:

- Debounced search (300ms delay)
- Platform selector (EA/Origin, PSN, Xbox, Steam)
- Autocomplete dropdown
- Direct API call to Tracker.gg search endpoint
- Saves selection to localStorage and URL

**Platforms Supported**:

- `origin` → EA/Origin (maps to `ign` in API)
- `psn` → PlayStation Network
- `xbl` → Xbox Live (maps to `xbox` in API)
- `steam` → Steam

**API Endpoint**: `https://api.tracker.gg/api/v2/bf6/standard/search`

### 3. Player Overview (`components/PlayerOverview.tsx`)

**Purpose**: Display key player statistics in a summary card.

**Displays**:

- Player name and avatar
- Current rank and rank image
- K/D ratio, Win rate, Total matches, Total kills
- Most played gamemode
- Most used weapon
- Most used class/kit

**Data Sources**:

- Combines data from `matches`, `kdRatio`, `wlPercentage`, and `profile`
- Handles delta snapshots by finding maximum cumulative values across all matches

### 4. Matches Dashboard (`components/MatchesDashboard.tsx`)

**Purpose**: Comprehensive match performance analysis.

**Sections**:

- Overall stats (matches, win rate, K/D, KDA)
- Extended stats (score, damage, headshots, revives, assists, multi-kills)
- Performance metrics (kills/match, damage/match, kills/min)
- Combat breakdown (weapon/vehicle/gadget/melee kills)
- Shooting statistics (shots fired, accuracy, ADS/hipfire kills)
- Objective performance (captured, defended, destroyed, armed, disarmed)
- Gamemode performance
- Class/kit performance
- Top weapons (ranked by kills)
- Map performance
- Vehicle usage
- Gadget usage
- Kill type breakdown
- Weapon categories

**Data Processing**:

- Handles delta snapshots by iterating through all matches to find maximum cumulative values
- Supports both API response structures (with/without hash wrapper)

### 5. K/D Ratio Dashboard (`components/KDRatioDashboard.tsx`)

**Purpose**: Detailed K/D ratio analysis with historical trends.

**Features**:

- Current, best, average, worst K/D ratios
- Historical chart with area visualization
- Performance level classification (Elite, Excellent, Good, Average, Below Average)
- Trend analysis (improving/declining/stable)
- Consistency metrics (standard deviation)
- Days above 1.0 K/D threshold
- Daily performance breakdown

**Performance Levels**:

- Elite: ≥ 2.0
- Excellent: ≥ 1.5
- Good: ≥ 1.0
- Average: ≥ 0.8
- Below Average: < 0.8

### 6. Win/Loss Dashboard (`components/WLPercentageDashboard.tsx`)

**Purpose**: Win rate analysis with historical trends.

**Features**:

- Current, best, average, worst win rates
- Historical chart with area visualization
- Performance level classification
- Trend analysis
- Consistency metrics
- Days above 50% win rate threshold
- Daily performance breakdown

**Performance Levels**:

- Dominant: ≥ 80%
- Excellent: ≥ 60%
- Winning: ≥ 50%
- Average: ≥ 40%
- Struggling: < 40%

### 7. Supporting Components

**StatCard** (`components/StatCard.tsx`):

- Reusable card component for displaying statistics
- Supports trend indicators (up/down/neutral)
- Optional icon support

**HistoryChart** (`components/HistoryChart.tsx`):

- Reusable line chart component
- Configurable color and value formatting
- Uses Recharts library

**GamemodeStats, KitStats, WeaponStats**:

- Specialized components for displaying specific stat types
- Currently defined but may not be actively used (functionality integrated into MatchesDashboard)

---

## API Architecture

### Client-Side API (`lib/api.ts`)

**Purpose**: Direct client-side calls to Tracker.gg API.

**Key Functions**:

- `fetchKDRatio(playerId, platform)`: Fetch K/D ratio history and leaderboard
- `fetchWLPercentage(playerId, platform)`: Fetch win/loss percentage history
- `fetchMatches(playerId, platform)`: Fetch match data with metadata
- `fetchProfile(playerId, platform)`: Fetch player profile information

**Important Notes**:

- All functions make direct client-side `fetch` calls from the browser
- Requires browser cookies (`credentials: 'include'`) to authenticate with Tracker.gg API
- Headers mimic browser requests to ensure proper API access
- Platform mapping: `xbl` → `xbox`, `origin` → `ign`
- All API calls are made directly from the client, no server-side proxying

**API Base URL**: `https://api.tracker.gg/api/v2/bf6/standard`

**Endpoints**:

- `/profile/{platform}/{playerId}` - Profile data
- `/profile/{platform}/{playerId}/stats/overview/kdRatio` - K/D ratio
- `/profile/{platform}/{playerId}/stats/overview/wlPercentage` - Win/Loss percentage
- `/matches/{platform}/{playerId}?updateHash={hash}` - Match data
- `/search?platform={platform}&query={query}&autocomplete=true` - Player search

---

## Data Flow

### Player Selection Flow

```
1. User enters search query in PlayerSearch component
   ↓
2. Debounced API call to Tracker.gg search endpoint
   ↓
3. User selects player from dropdown
   ↓
4. Player ID and platform saved to localStorage
   ↓
5. URL updated with query parameters (?playerId=...&platform=...)
   ↓
6. Main page detects URL change via useSearchParams
   ↓
7. Parallel data fetching:
   - fetchKDRatio()
   - fetchWLPercentage()
   - fetchMatches()
   - fetchProfile()
   ↓
8. Data loaded into state
   ↓
9. Components render with new data
```

### Data Fetching Flow

```
Client Request (Browser)
   ↓
Direct fetch() call to Tracker.gg API
   ↓
Tracker.gg API (with browser cookies)
   ↓
Response Processing
   ↓
Data Transformation
   ↓
Component Rendering
```

---

## Configuration

### Next.js Configuration (`next.config.mjs`)

**Image Optimization**:

- Remote patterns configured for `trackercdn.com`
- All images optimized via Next.js Image component

### TypeScript Configuration (`tsconfig.json`)

**Key Settings**:

- Target: ES2017
- Module: esnext
- Module Resolution: bundler
- JSX: react-jsx
- Path aliases: `@/*` → `./*`

### Tailwind Configuration (`tailwind.config.ts`)

**Content Sources**:

- `./pages/**/*.{js,ts,jsx,tsx,mdx}`
- `./components/**/*.{js,ts,jsx,tsx,mdx}`
- `./app/**/*.{js,ts,jsx,tsx,mdx}`

**Theme Extensions**:

- CSS variables for background/foreground colors

### Vercel Configuration (`vercel.json`)

**Function Timeouts**:

- API routes max duration: 30 seconds

---

## Dependencies

### Production Dependencies

- `next`: ^16.0.0 - React framework
- `react`: ^19.0.0 - UI library
- `react-dom`: ^19.0.0 - React DOM renderer
- `react-icons`: ^5.5.0 - Icon library
- `recharts`: ^2.12.0 - Chart library
- `undici`: ^7.16.0 - HTTP client (used by Next.js)

### Development Dependencies

- `@types/node`: ^22.0.0 - Node.js type definitions
- `@types/react`: ^19.0.0 - React type definitions
- `@types/react-dom`: ^19.0.0 - React DOM type definitions
- `autoprefixer`: ^10.4.19 - CSS vendor prefixing
- `postcss`: ^8.4.39 - CSS post-processor
- `tailwindcss`: ^3.4.4 - Utility-first CSS framework
- `typescript`: ^5.7.0 - TypeScript compiler

---

## Environment Variables

### No Environment Variables Required

This application uses full client-side querying, which means:

- All API calls are made directly from the browser
- No server-side environment variables are needed
- Browser cookies are automatically included in requests
- No Cloudflare bypass services are required

---

## Platform Support

### Supported Platforms

1. **EA/Origin** (`origin`)

   - API endpoint: `ign`
   - Default platform

2. **PlayStation Network** (`psn`)

   - API endpoint: `psn`

3. **Xbox Live** (`xbl`)

   - API endpoint: `xbox`
   - Note: Platform slug `xbl` is mapped to `xbox` in API calls

4. **Steam** (`steam`)
   - API endpoint: `steam`

### Platform Mapping Logic

```typescript
// For matches endpoint
const platformEndpoint = platform === "xbl" ? "xbox" : platform;

// For profile endpoint
const platformEndpoint =
  platform === "xbl"
    ? "xbox"
    : platform === "psn"
    ? "psn"
    : platform === "steam"
    ? "steam"
    : "ign"; // origin defaults to ign
```

---

## Common Issues & Solutions

### 1. Cloudflare Protection

**Issue**: API calls blocked by Cloudflare bot protection.

**Symptoms**:

- 403 Forbidden errors
- Empty responses
- CORS errors

**Solutions**:

- Ensure cookies are enabled in browser
- All API calls are already client-side (implemented in `lib/api.ts`)
- Make sure you're accessing the dashboard from a browser (not server-side)
- The application uses browser cookies automatically to authenticate with Tracker.gg API

### 3. Player Not Found

**Issue**: Player ID doesn't exist or is incorrect.

**Symptoms**:

- 404 errors
- Empty data responses

**Solution**:

- Verify player ID using Tracker.gg website
- Ensure correct platform is selected
- Check if player profile is public

### 4. Update Hash Expired

**Issue**: `UPDATE_HASH` constant may expire.

**Symptoms**:

- Matches endpoint returns errors
- Missing match data

**Solution**:

- Update `UPDATE_HASH` in `lib/api.ts`
- Hash can be found in Tracker.gg URL when viewing matches

### 5. localStorage Not Persisting

**Issue**: Player selection not saved between sessions.

**Symptoms**:

- Player selection resets on page reload
- URL doesn't reflect saved player

**Solution**:

- Check browser localStorage support
- Ensure cookies/localStorage are enabled
- Check browser privacy settings

---

## Development Guide

### Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Development Server**:

   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000`

### Development Workflow

1. **Component Development**:

   - Components are in `components/` directory
   - Use TypeScript for type safety
   - Follow existing component patterns

2. **API Development**:

   - Client-side APIs in `lib/api.ts`
   - All API calls are made directly from the browser
   - Test API endpoints directly in browser DevTools Network tab

3. **Styling**:
   - Use Tailwind CSS utility classes
   - Dark theme with gray color palette
   - Responsive design with mobile-first approach

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **File Organization**: One component per file

### Testing

Currently no test suite configured. Consider adding:

- Jest + React Testing Library
- E2E tests with Playwright
- API route tests

---

## Deployment

### Vercel Deployment

The project is configured for Vercel deployment:

1. **Configuration**: `vercel.json` sets API route timeouts
2. **Build Command**: `npm run build` (default)
3. **Output Directory**: `.next` (default)

### Environment Variables

No environment variables are required for this application. All API calls are made client-side from the browser.

### Build Process

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run linter
```

### Deployment Checklist

- [ ] Verify `UPDATE_HASH` is current
- [ ] Test API endpoints in browser
- [ ] Verify image domains in `next.config.mjs`
- [ ] Test player search functionality
- [ ] Verify localStorage persistence
- [ ] Ensure cookies are enabled for API access

---

## API Data Structures

### KDRatioData

```typescript
{
  data: {
    history: {
      metadata: { key, name, description },
      data: Array<[date, { value, displayValue, displayType }]>
    },
    leaderboard: {
      entries: Array<{
        platformInfo: { platformUserHandle },
        value: { value, displayValue },
        rank: { value }
      }>
    }
  }
}
```

### WLPercentageData

```typescript
{
  data: {
    history: {
      metadata: { key, name, description },
      data: Array<[date, { value, displayValue, displayType }]>
    },
    leaderboard: {
      entries: Array<{
        platformInfo: { platformUserHandle },
        value: { value, displayValue },
        rank: { value }
      }>
    }
  }
}
```

### MatchData

```typescript
{
  data: {
    matches: Array<{
      attributes: { type, id },
      metadata: { timestamp },
      segments: Array<{
        type: string,
        metadata?: {
          gamemodes?: Array<{...}>,
          kits?: Array<{...}>,
          weapons?: Array<{...}>,
          levels?: Array<{...}>,
          vehicles?: Array<{...}>,
          gadgets?: Array<{...}>
        },
        stats?: {
          matchesPlayed?: { value, displayValue },
          kills?: { value, displayValue },
          // ... many more stats
        }
      }>
    }>
  }
}
```

### ProfileData

```typescript
{
  data: {
    platformInfo: {
      platformUserHandle: string,
      avatarUrl: string | null
    },
    userInfo: {
      userId: string | null,
      isPremium: boolean
    }
  }
}
```

---

## Future Enhancements

### Recommended Improvements

1. **Error Handling**:

   - Add retry logic for failed API calls
   - Better error messages for users
   - Fallback UI states

2. **Performance**:

   - Implement data caching
   - Add loading skeletons
   - Optimize image loading

3. **Features**:

   - Compare multiple players
   - Export data as CSV/JSON
   - Share player stats via URL
   - Favorite players list

4. **Testing**:

   - Unit tests for components
   - Integration tests for API routes
   - E2E tests for user flows

5. **Accessibility**:

   - ARIA labels
   - Keyboard navigation
   - Screen reader support

6. **Documentation**:
   - Component Storybook
   - API documentation
   - User guide

---

## Contact & Support

For issues or questions:

- Check the [Common Issues](#common-issues--solutions) section
- Review API documentation at Tracker.gg
- Check Next.js documentation for framework-specific issues

---

## License

MIT License - See LICENSE file for details.

---

**Last Updated**: Based on codebase inspection on current date
**Version**: 0.1.0
**Maintainer**: See package.json or repository maintainers
