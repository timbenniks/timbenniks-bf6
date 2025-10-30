# Battlefield 6 Stats Dashboard

A beautiful, interactive dashboard for displaying your Battlefield 6 gameplay statistics using data from Tracker.gg.

## Features

- 📊 **Real-time Statistics**: K/D ratio, win rate, total matches, and more
- 📈 **Historical Charts**: Track your performance over time with interactive line charts
- 🎮 **Gamemode Analysis**: Detailed stats for each game mode (Conquest, Breakthrough, etc.)
- 🎯 **Class Performance**: See how you perform with each class (Assault, Engineer, etc.)
- 🔫 **Weapon Stats**: Top weapons ranked by kills, accuracy, and more
- 🏆 **Leaderboard Comparison**: See how you rank against other players

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Important Notes

⚠️ **API Authentication**: The Tracker.gg API requires browser cookies and headers to bypass Cloudflare bot protection. This means:

- The dashboard **must** be accessed from a browser (not server-side)
- All API calls are made client-side using `fetch` with `credentials: 'include'`
- Make sure cookies are enabled in your browser
- The API endpoints are configured in `lib/api.ts`

## Configuration

The player ID and update hash are currently hardcoded in `lib/api.ts`. To change them:

1. Open `lib/api.ts`
2. Update the `PLAYER_ID` and `UPDATE_HASH` constants
3. The update hash can be found in the URL when viewing your matches on tracker.gg

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Next Image** - Optimized image loading

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main dashboard page
│   └── globals.css      # Global styles
├── components/
│   ├── StatCard.tsx     # Stat display cards
│   ├── HistoryChart.tsx # Historical data charts
│   ├── GamemodeStats.tsx # Gamemode performance
│   ├── KitStats.tsx     # Class/kit performance
│   └── WeaponStats.tsx  # Weapon statistics
└── lib/
    └── api.ts           # API client functions
```

## License

MIT

