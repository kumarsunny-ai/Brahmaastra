import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { type GameData, statusConfig } from "@/data/games";
import { gameIcons } from "@/assets/icons";

type GameCardProps = GameData;

const GameCard = ({ slug, title, description, status, statusLabel, ctaLabel, emoji, featured, tags }: GameCardProps) => {
  const style = statusConfig[status];
  const isPlayable = status === "playable";
  const iconSrc = gameIcons[slug];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl p-1 ${featured ? "gradient-border" : ""}`}
    >
      <div
        className={`relative rounded-2xl p-7 transition-all duration-300 h-full flex flex-col ${
          featured
            ? "featured-card border-0 glow-primary"
            : "bg-card border border-border/50 card-glow hover:border-primary/20"
        }`}
      >
        {featured && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-3 left-5 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full gradient-bg text-primary-foreground shadow-lg"
          >
            <Sparkles size={12} />
            Featured
          </motion.span>
        )}

        <motion.div
          className="mb-4"
          animate={featured ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
        {iconSrc ? (
            <img
              src={iconSrc}
              alt={`${title} icon`}
              className="w-16 h-16 object-contain icon-glow"
            />
          ) : (
            <span className="text-5xl">{emoji}</span>
          )}
        </motion.div>

        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${isPlayable ? "animate-pulse" : ""}`} />
            {statusLabel}
          </span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{description}</p>

        {tags && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground bg-secondary/40">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          {isPlayable ? (
            <>
              <Link
                to={`/play/${slug}`}
                className="group inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl gradient-bg text-primary-foreground hover:opacity-90 transition-all"
              >
                Play Now
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={`/games/${slug}`}
                className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
              >
                Details
              </Link>
            </>
          ) : (
            <Link
              to={`/games/${slug}`}
              className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
