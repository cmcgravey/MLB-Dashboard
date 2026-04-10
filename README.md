# Phillies Tracker

A sleek web application for tracking Philadelphia Phillies games, standings, and roster information in real-time. Built with Next.js, TypeScript, and Material UI.

> **Note:** This application is currently scoped to the Philadelphia Phillies. Future versions will expand to cover all MLB teams.

## Features

- **Recent Games** - View the last 30 days of Phillies games with scores, dates, and game status
- **Team Standings** - Track wins, losses, division rank, games back, and current streak
- **Roster** - Browse the complete Phillies roster with player names and positions
- **Real-time Data** - All data is fetched from the official MLB Stats API
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Framework:** Next.js 16.2.3 (App Router)
- **Language:** TypeScript
- **UI Library:** Material UI (@mui/material)
- **Styling:** Standard CSS
- **Data Source:** [MLB Stats API](https://statsapi.mlb.com)
- **Linting:** ESLint

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## API Integration

Data is fetched from the MLB Stats API with built-in caching:
- **Games:** 5-minute cache (fetches last 30 days of regular season games)
- **Standings:** 1-hour cache
- **Roster:** 1-hour cache

## Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Create optimized production build
npm start        # Start production server
npm run lint     # Run ESLint
```
