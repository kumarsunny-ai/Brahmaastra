import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface GameCardProps {
  title: string;
  description: string;
  status: "live" | "coming-soon" | "beta";
  ctaLabel: string;
  ctaLink: string;
  emoji: string;
  featured?: boolean;
}

const statusColors = {
  live: "bg-accent/20 text-accent",
  beta: "bg-primary/20 text-primary",
  "coming-soon": "bg-muted text-muted-foreground",
};

const statusLabels = {
  live: "Live",
  beta: "Beta",
  "coming-soon": "Coming Soon",
};

const GameCard = ({ title, description, status, ctaLabel, ctaLink, emoji, featured }: GameCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative bg-card border rounded-xl p-6 transition-colors ${
        featured ? "border-primary/40 glow-primary" : "border-border hover:border-primary/30"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-4 text-xs font-medium px-3 py-1 rounded-full gradient-bg text-primary-foreground">
          Featured
        </span>
      )}
      <div className="text-5xl mb-4">{emoji}</div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <p className="text-muted-foreground text-sm mb-5">{description}</p>
      <Link
        to={ctaLink}
        className={`inline-flex text-sm font-medium px-5 py-2 rounded-lg transition-all ${
          featured
            ? "gradient-bg text-primary-foreground hover:opacity-90"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        {ctaLabel}
      </Link>
    </motion.div>
  );
};

export default GameCard;
