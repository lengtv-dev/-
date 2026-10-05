# STREAM M3U Xtreme Player & EPG

A modern IPTV / Xtream streaming web app built with React, Vite, and Express. It connects to Xtream-compatible IPTV backends, lets users browse live channels, VOD, and series, watch streams, manage favorites/history, and view a generated EPG-style guide.

This repository contains both the frontend interface and a lightweight proxy server for handling Xtream API requests and media delivery.

## Features

- Live TV, VOD, and series browsing
- Xtream API login and session management
- Category filtering and search
- Favorites and watch history
- Adult content toggle with PIN protection
- Media proxy for TS/M3U8/MP4/MKV sources
- Real-time or generated EPG listings
- Package registration / membership flow
- Responsive UI with desktop sidebar and mobile bottom navigation
- Dark/light theme support

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- HLS.js
- Tailwind CSS
- Google GenAI integration (project metadata indicates Gemini capability)

## Project Structure

- `src/` – React frontend application
- `src/components/` – UI components
- `src/services/` – API and storage logic
- `src/types/` – TypeScript interfaces
- `server.ts` – Express server and stream/Xtream proxies
- `index.html` – Vite app entry
- `vite.config.ts` – Vite configuration
- `package.json` – scripts and dependencies
- `.env.example` – environment variable template

## Getting Started

1. Install dependencies:

   ```bash
   npm install
