import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-7xl mb-4">🎮</div>
        <h1 className="font-display text-5xl font-bold text-foreground mb-3">404</h1>
        <p className="text-muted-foreground mb-8">
          This page doesn't exist — but our games do!
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium px-6 py-3 rounded-xl gradient-bg text-primary-foreground hover:opacity-90 transition-all"
          >
            Back to Home
          </Link>
          <Link
            to="/games"
            className="inline-flex items-center text-sm font-medium px-6 py-3 rounded-xl bg-secondary border border-border/50 text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            Browse Games
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
