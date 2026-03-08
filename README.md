# Brahmaastra — Indie Game Studio

**Brahmaastra** is an indie game studio crafting playful, culturally inspired browser games with desi soul and global fun.

## 🎮 Flagship Game: Gilli Panda

A playful browser game inspired by the classic Indian street sport Gilli-Danda.

- Set your power and choose your angle
- Launch the gilli sky-high and chase legendary distances
- Compete for high scores — all from your browser, no download needed

**Status:** Playable MVP — [Play Now](https://brahmaastra.com/play/gilli-panda)

## 🗺️ Game Roadmap

| Game                  | Status         |
| --------------------- | -------------- |
| Gilli Panda           | ✅ Playable    |
| AutoRickshaw Rampage  | 🚧 In Development |
| Dabba Dash            | 🚧 In Development |
| Chai Tapper           | 💡 Concept     |
| Metro Surfers         | 💡 Concept     |

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **Routing:** React Router

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components (Header, Footer, GameCard, etc.)
│   └── ui/           # shadcn/ui primitives
├── data/             # Game data and configuration
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Route-level page components
└── assets/           # Images and static assets
```

## 🌐 Routes

| Path             | Page              |
| ---------------- | ----------------- |
| `/`              | Home              |
| `/games`         | All Games         |
| `/games/:slug`   | Game Detail       |
| `/play/:slug`    | Play Game         |
| `/about`         | About the Studio  |
| `/contact`       | Contact           |
| `/privacy`       | Privacy Policy    |
| `/terms`         | Terms of Use      |

## 🚀 Getting Started

```sh
git clone https://github.com/your-username/brahmaastra.git
cd brahmaastra
npm install
npm run dev
```

## 📄 License

All game assets, code, designs, and branding are owned by Brahmaastra. All rights reserved.
