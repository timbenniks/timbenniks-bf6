# Battlefield 6 Stats Dashboard

A beautiful, interactive dashboard for displaying your Battlefield 6 gameplay statistics using data from Tracker.gg.

## 📚 Documentation

**👉 For complete documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)**

The comprehensive documentation includes:
- Complete architecture overview
- Detailed component documentation
- API reference and data structures
- Platform support details
- Common issues and solutions
- Development guide
- Deployment instructions

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- 📊 **Real-time Statistics**: K/D ratio, win rate, total matches, and more
- 📈 **Historical Charts**: Track your performance over time with interactive line charts
- 🎮 **Gamemode Analysis**: Detailed stats for each game mode (Conquest, Breakthrough, etc.)
- 🎯 **Class Performance**: See how you perform with each class (Assault, Engineer, etc.)
- 🔫 **Weapon Stats**: Top weapons ranked by kills, accuracy, and more
- 🏆 **Leaderboard Comparison**: See how you rank against other players
- 🔍 **Player Search**: Search for players across multiple platforms (EA/Origin, PSN, Xbox, Steam)

## Important Notes

⚠️ **Client-Side API Calls**: This application uses full client-side querying, which means:

- The dashboard **must** be accessed from a browser (not server-side)
- All API calls are made directly from the browser using `fetch` with `credentials: 'include'`
- Browser cookies are automatically included to authenticate with Tracker.gg API
- Make sure cookies are enabled in your browser
- The API endpoints are configured in `lib/api.ts`

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 3.4** - Styling
- **Recharts 2.12** - Data visualization
- **React Icons 5.5** - Icon library

## Project Structure

```
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/
│   ├── StatCard.tsx       # Reusable stat display cards
│   ├── HistoryChart.tsx   # Historical data charts
│   ├── KDRatioDashboard.tsx  # K/D ratio analysis
│   ├── WLPercentageDashboard.tsx  # Win/Loss analysis
│   ├── MatchesDashboard.tsx  # Match performance
│   ├── PlayerOverview.tsx   # Player summary
│   ├── PlayerSearch.tsx     # Player search component
│   └── ...                 # Additional components
└── lib/
    └── api.ts             # Client-side API functions
```

## Configuration

The default player ID and update hash are configured in `lib/api.ts`. Players can be searched and selected via the search interface, which saves to localStorage and URL query parameters.

## Support

For detailed information, troubleshooting, and development guides, please refer to [DOCUMENTATION.md](./DOCUMENTATION.md).

## License

MIT

