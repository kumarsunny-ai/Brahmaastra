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
    emoji: "🐼",
    description: "A cute panda plays Gilli-Danda! Flip the gilli up, then smash it as far as you can.",
    longDescription:
      "Gilli Panda brings India's beloved Gilli-Danda to life with a cute panda character. In each round, tap to set the perfect angle and flip the gilli into the air, then tap again with the right power to send it flying across the field. Play 5 rounds and aim for the highest total distance!",
    status: "playable",
    statusLabel: "Playable MVP",
    tags: ["Browser Game", "Arcade", "Desi Sports", "Family Fun"],
    ctaLabel: "Play Now",
    featured: true,
    howToPlay: [
      "Tap when the angle meter is in the green zone to flip the gilli upward.",
      "Tap again when the power meter is in the green zone to smash the gilli forward.",
      "Better timing on both meters = more distance and higher score.",
      "You have 5 rounds — aim for the highest total score!",
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
