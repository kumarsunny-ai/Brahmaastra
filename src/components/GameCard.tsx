import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  status: "live" | "coming-soon" | "beta";
  ctaLabel: string;
  ctaLink: string;
  emoji: string;
  featured?: boolean;
}

const statusConfig = {
  live: { bg: "bg-accent/15", text: "text-accent", dot: "bg-accent", label: "Live" },
  beta: { bg: "bg-primary/15", text: "text-primary", dot: "bg-primary", label: "Beta" },
  "coming-soon": { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", label: "Coming Soon" },
};

const GameCard = ({ title, description, status, ctaLabel, ctaLink, emoji, featured }: GameCardProps) => {
  const statusStyle = statusConfig[status];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl p-1 ${featured ? "gradient-border" : ""}`}
    >
      <div
        className={`relative rounded-2xl p-7 transition-all duration-300 ${
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
          className="text-6xl mb-5"
          animate={featured ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {emoji}
        </motion.div>

        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${status === "live" ? "animate-pulse" : ""}`} />
            {statusStyle.label}
          </span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{description}</p>

        <Link
          to={ctaLink}
          className={`group inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 ${
            featured
              ? "gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {ctaLabel}
          {featured && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
        </Link>
      </div>
    </motion.div>
  );
};

export default GameCard;
