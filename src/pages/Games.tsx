import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import GameCard from "@/components/GameCard";
import { games } from "@/data/games";

const allTags = ["All", ...Array.from(new Set(games.flatMap((g) => g.tags)))];

const Games = () => {
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All" ? games : games.filter((g) => g.tags.includes(activeTag));

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <SectionHeading title="Our Games" subtitle="Handcrafted experiences rooted in Indian culture" />

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
