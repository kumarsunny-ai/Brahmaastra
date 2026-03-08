import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import GameCard from "@/components/GameCard";
import { games, statusConfig } from "@/data/games";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const flagship = games.find((g) => g.featured)!;
const otherGames = games.filter((g) => !g.featured);
const allTags = ["All", ...Array.from(new Set(otherGames.flatMap((g) => g.tags)))];

const Games = () => {
  useDocumentTitle("Games — Brahmaastra");
  const [activeTag, setActiveTag] = useState("All");
  const filtered = activeTag === "All" ? otherGames : otherGames.filter((g) => g.tags.includes(activeTag));
  const flagshipStyle = statusConfig[flagship.status];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <SectionHeading title="Game Catalog" subtitle="Handcrafted browser games rooted in Indian culture" />

        {/* Flagship Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl p-[2px] gradient-border mb-16"
        >
          <div className="relative rounded-2xl featured-card border-0 glow-primary overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
              {/* Left — Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full gradient-bg text-primary-foreground mb-4">
                  <Sparkles size={12} />
                  Flagship Game
                </div>
                <motion.div
                  className="text-6xl md:text-7xl mb-4"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {flagship.emoji}
                </motion.div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {flagship.title}
                </h2>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${flagshipStyle.bg} ${flagshipStyle.text} mb-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${flagshipStyle.dot} animate-pulse`} />
                  {flagship.statusLabel}
                </span>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">
                  {flagship.longDescription}
                </p>
                <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                  {flagship.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full border border-border/50 text-muted-foreground bg-secondary/40">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 justify-center md:justify-start">
                  <Link
                    to={`/play/${flagship.slug}`}
                    className="group inline-flex items-center gap-2 text-base font-medium px-6 py-3 rounded-xl gradient-bg text-primary-foreground hover:opacity-90 transition-all"
                  >
                    Play Now
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to={`/games/${flagship.slug}`}
                    className="inline-flex items-center text-base font-medium px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                  >
                    Game Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Divider */}
        <SectionHeading title="More Games" subtitle="Upcoming titles from the studio" />

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <Gamepad2 size={16} className="text-muted-foreground mr-1" />
          {allTags.map((tag) => (
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
            {filtered.map((game) => (
              <GameCard key={game.slug} {...game} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No games match this filter yet.</p>
        )}
      </div>
    </div>
  );
};

export default Games;
