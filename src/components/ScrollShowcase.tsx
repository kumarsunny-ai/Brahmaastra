import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { games } from "@/data/games";

const showcaseGames = games.filter((g) => g.status === "playable").slice(0, 4);

const ScrollShowcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headingY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={sectionRef} className="py-24 md:py-40 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[200px]" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Apple-style centered heading */}
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold gradient-text mb-4">
            Six Games.
          </h2>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6">
            One Studio.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Every game is handcrafted with love, rooted in Indian culture, and built to run instantly in your browser.
          </p>
        </motion.div>

        {/* Game cards - staggered grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {showcaseGames.map((game, i) => (
            <GameShowcaseCard key={game.slug} game={game} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/games"
            className="text-base text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all games →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

interface GameShowcaseCardProps {
  game: (typeof games)[0];
  index: number;
}

const GameShowcaseCard = ({ game, index }: GameShowcaseCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, scale }}
      className={`${index % 2 === 1 ? "md:mt-16" : ""}`}
    >
      <Link
        to={game.status === "playable" ? `/play/${game.slug}` : `/games/${game.slug}`}
        className="group block featured-card rounded-2xl md:rounded-3xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-500"
      >
        <div className="p-8 md:p-10">
          <span className="text-5xl md:text-6xl block mb-6">{game.emoji}</span>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-sm">
            {game.description}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {game.status === "playable" && (
              <span className="inline-flex items-center px-4 py-2 rounded-full gradient-bg text-primary-foreground text-sm font-medium">
                Play Now →
              </span>
            )}
            {game.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-secondary/80 text-xs text-muted-foreground border border-border/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ScrollShowcase;
