import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Gamepad2, Play, Eye } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import GameCard from "@/components/GameCard";

const tags = ["All", "Browser Game", "Indie", "Family Fun", "Desi Sports", "Multiplayer"] as const;

type GameData = {
  title: string;
  description: string;
  status: "live" | "coming-soon" | "beta";
  ctaLabel: string;
  ctaLink: string;
  emoji: string;
  featured?: boolean;
  tags: string[];
  statusLabel: string;
};

const games: GameData[] = [
  {
    title: "Gilli Panda",
    description: "A mythic twist on India's timeless Gilli-Danda. Time your swings and chase legendary distances!",
    status: "live",
    ctaLabel: "Play Now",
    ctaLink: "/play",
    emoji: "🏏",
    featured: true,
    tags: ["Browser Game", "Indie", "Family Fun", "Desi Sports"],
    statusLabel: "Playable MVP",
  },
  {
    title: "Chakravyuh Run",
    description: "Navigate the ancient spiral maze in this endless runner inspired by Mahabharata.",
    status: "coming-soon",
    ctaLabel: "Coming Soon",
    ctaLink: "#",
    emoji: "🌀",
    tags: ["Browser Game", "Indie"],
    statusLabel: "In Development",
  },
  {
    title: "Kabaddi Clash",
    description: "Fast-paced multiplayer kabaddi action. Raid, defend, and outsmart your opponents.",
    status: "coming-soon",
    ctaLabel: "Coming Soon",
    ctaLink: "#",
    emoji: "⚡",
    tags: ["Multiplayer", "Desi Sports", "Indie"],
    statusLabel: "In Development",
  },
];

const Games = () => {
  const [activeTag, setActiveTag] = useState<string>("All");

  const filteredGames = activeTag === "All"
    ? games
    : games.filter((g) => g.tags.includes(activeTag));

  const featuredGame = games.find((g) => g.featured);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <SectionHeading title="Our Games" subtitle="Handcrafted experiences rooted in Indian culture" />

        {/* Featured Game Hero */}
        {featuredGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-16 rounded-2xl overflow-hidden border border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <motion.div
                className="text-8xl md:text-9xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {featuredGame.emoji}
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full gradient-bg text-primary-foreground">
                    <Sparkles size={12} />
                    Featured
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-accent/15 text-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    {featuredGame.statusLabel}
                  </span>
                </div>

                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {featuredGame.title}
                </h2>
                <p className="text-muted-foreground max-w-lg mb-4 leading-relaxed">
                  {featuredGame.description}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                  {featuredGame.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border border-border/60 text-muted-foreground bg-secondary/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link
                    to="/play"
                    className="group inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-xl gradient-bg text-primary-foreground hover:opacity-90 transition-all glow-primary"
                  >
                    <Play size={16} />
                    Play Now
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/play"
                    className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-xl border border-border/60 text-foreground bg-secondary/50 hover:bg-secondary transition-all"
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <Gamepad2 size={16} className="text-muted-foreground mr-1" />
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
                activeTag === tag
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground bg-secondary/30"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTag}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredGames.map((game) => (
              <GameCard key={game.title} {...game} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredGames.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No games match this filter yet.</p>
        )}
      </div>
    </div>
  );
};

export default Games;
