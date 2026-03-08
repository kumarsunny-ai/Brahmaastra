import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star } from "lucide-react";

interface ScoreSubmitModalProps {
  open: boolean;
  score: number;
  isNewRecord: boolean;
  onSubmit: (name: string) => void;
  onSkip: () => void;
}

const ScoreSubmitModal = ({ open, score, isNewRecord, onSubmit, onSkip }: ScoreSubmitModalProps) => {
  const [name, setName] = useState(() => localStorage.getItem("gilliPanda_playerName") || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || "Anonymous";
    localStorage.setItem("gilliPanda_playerName", trimmed);
    onSubmit(trimmed);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && onSkip()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isNewRecord ? (
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star size={20} className="text-game-score" />
                <span className="font-display text-lg font-bold text-game-score">New Record!</span>
                <Star size={20} className="text-game-score" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy size={20} className="text-primary" />
                <span className="font-display text-lg font-bold text-foreground">Great Game!</span>
              </div>
            )}

            <p className="text-5xl font-display font-bold text-game-score mb-1">{score.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mb-6">You made the leaderboard!</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/50 text-foreground text-center font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  onKeyDown={(e) => {
                    // Prevent game input while typing
                    e.stopPropagation();
                  }}
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl gradient-bg text-primary-foreground font-medium glow-primary hover:opacity-90 transition-all"
              >
                Submit Score
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScoreSubmitModal;
