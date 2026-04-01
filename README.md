# QuickCast Oracle

QuickCast Oracle is a decentralized prediction market / oracle-style web application built with **React + Vite + TypeScript**, with **Algorand wallet integration** and **Supabase** for backend services.

## Features

- Create and explore prediction markets
- View market details and outcomes
- Leaderboard for participants
- Algorand wallet connection using **Pera Wallet**
- Backend integration with Supabase
- Modern frontend built with React, TypeScript, Tailwind, and shadcn/ui

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Blockchain:** Algorand
- **Wallet:** Pera Wallet
- **Backend / Database:** Supabase
- **Testing:** Vitest, Playwright

## Project Structure

```bash
src/
  algorand/         # Algorand client and config
  components/       # Reusable UI components
  context/          # App state/context
  data/             # Static or helper data
  hooks/            # Custom React hooks
  integrations/     # External integrations
    supabase/       # Supabase client/types
  pages/            # Main app pages
    Index.tsx
    Leaderboard.tsx
    MarketDetails.tsx
supabase/
  migrations/       # Database migrations
