export type GameStatus = "playable" | "coming-soon" | "concept" | "prototype";

export interface GameData {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  longDescription: string;
  status: GameStatus;
  statusLabel: string;
  tags: string[];
  ctaLabel: string;
  featured?: boolean;
  howToPlay?: string[];
}

export const games: GameData[] = [
  {
    slug: "gilli-panda",
    title: "Gilli Panda",
    emoji: "🏏",
    description: "A timing-based arcade game inspired by India's classic Gilli-Danda street sport.",
    longDescription:
      "Gilli Panda reimagines India's timeless Gilli-Danda as a fast, fun browser arcade game. Time your swings to hit the gilli as it flies toward you — nail the timing for bonus points, chain hits for combos, and climb the leaderboard. Three misses and it's game over!",
    status: "playable",
    statusLabel: "Playable MVP",
    tags: ["Browser Game", "Arcade", "Desi Sports", "Family Fun"],
    ctaLabel: "Play Now",
    featured: true,
    howToPlay: [
      "A gilli (small stick) flies toward you from the right — watch its speed and position.",
      "Click, tap, or press Spacebar to swing your bat when the gilli enters the strike zone.",
      "Perfect timing earns more points. Chain consecutive hits for combo multipliers.",
      "You have 3 lives — miss 3 gillis and the game is over. Beat your high score!",
    ],
  },
  {
    slug: "autorickshaw-rampage",
    title: "AutoRickshaw Rampage",
    emoji: "🛺",
    description: "A chaotic endless runner through busy Indian streets driving an auto-rickshaw.",
    longDescription:
      "Dodge traffic, collect fares, and survive the chaos of Indian streets in this adrenaline-pumping endless runner. Weave through rickshaws, buses, and cows as you rack up the highest score.",
    status: "coming-soon",
    statusLabel: "Coming Soon",
    tags: ["Browser Game", "Arcade", "Indie"],
    ctaLabel: "Coming Soon",
  },
  {
    slug: "chai-tapper",
    title: "Chai Tapper",
    emoji: "☕",
    description: "A fast reflex game where players run a chai stall serving customers quickly.",
    longDescription:
      "Brew, pour, and serve — keep the chai flowing in this fast-paced reflex game. Match orders, avoid spills, and keep your customers happy as the pace ramps up.",
    status: "concept",
    statusLabel: "Concept",
    tags: ["Browser Game", "Family Fun", "Indie"],
    ctaLabel: "Concept",
  },
  {
    slug: "dabba-dash",
    title: "Dabba Dash",
    emoji: "📦",
    description: "A puzzle strategy game inspired by the Mumbai dabbawala delivery system.",
    longDescription:
      "Sort, route, and deliver tiffins across Mumbai in this strategic puzzle game. Optimize your routes, beat the clock, and earn your place among legendary dabbawalas.",
    status: "prototype",
    statusLabel: "Prototype",
    tags: ["Browser Game", "Indie"],
    ctaLabel: "Prototype",
  },
  {
    slug: "metro-surfers",
    title: "Metro Surfers",
    emoji: "🚇",
    description: "A fast paced urban runner across metro platforms and rooftops.",
    longDescription:
      "Sprint, jump, and slide across metro platforms and city rooftops in this high-speed urban runner. Collect power-ups and dodge obstacles in an ever-changing cityscape.",
    status: "concept",
    statusLabel: "Concept",
    tags: ["Browser Game", "Arcade", "Indie"],
    ctaLabel: "Concept",
  },
];

export const statusConfig: Record<GameStatus, { bg: string; text: string; dot: string }> = {
  playable: { bg: "bg-accent/15", text: "text-accent", dot: "bg-accent" },
  "coming-soon": { bg: "bg-primary/15", text: "text-primary", dot: "bg-primary" },
  prototype: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  concept: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export const getGameBySlug = (slug: string) => games.find((g) => g.slug === slug);
