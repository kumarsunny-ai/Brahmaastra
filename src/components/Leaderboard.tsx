import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, User, Trash2 } from "lucide-react";
import { getLeaderboard, clearLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";

interface LeaderboardProps {
  refreshKey?: number; // bump to force refresh
}

const rankIcons = [
  <Crown size={16} className="text-game-score" />,
  <Medal size={16} className="text-muted-foreground" style={{ filter: "brightness(1.5)" }} />,
  <Medal size={16} className="text-game-bat" />,
];

const Leaderboard = ({ refreshKey = 0 }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [debugClicks, setDebugClicks] = useState(0);
  const [showClear, setShowClear] = useState(false);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, [refreshKey]);

  const handleClear = () => {
    clearLeaderboard();
    setEntries([]);
    setShowClear(false);
    setDebugClicks(0);
  };

  // Secret: click the trophy icon 5 times to reveal reset
  const handleTrophyClick = () => {
    const next = debugClicks + 1;
    setDebugClicks(next);
    if (next >= 5) setShowClear(true);
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handleTrophyClick} className="focus:outline-none" aria-label="Leaderboard">
            <Trophy size={20} className="text-game-score" />
          </button>
          <h3 className="font-display text-lg font-bold text-foreground">Leaderboard</h3>
        </div>
        <span className="text-xs text-muted-foreground">Top 10</span>
      </div>

      {/* Table */}
      <div className="px-4 py-3">
        {entries.length === 0 ? (
          <div className="text-center py-10">
            <Trophy size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No scores yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Play Gilli Panda to claim the #1 spot!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Column headers */}
            <div className="grid grid-cols-[40px_1fr_80px] px-2 py-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Score</span>
            </div>

            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`grid grid-cols-[40px_1fr_80px] items-center px-2 py-2.5 rounded-lg transition-colors ${
                    i === 0
                      ? "bg-game-score/10 border border-game-score/20"
                      : i < 3
                      ? "bg-secondary/50"
                      : "hover:bg-secondary/30"
                  }`}
                >
                  {/* Rank */}
                  <span className="flex items-center justify-center">
                    {i < 3 ? (
                      rankIcons[i]
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium">{i + 1}</span>
                    )}
                  </span>

                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="text-muted-foreground/50 shrink-0" />
                    <span
                      className={`text-sm font-medium truncate ${
                        i === 0 ? "text-game-score" : "text-foreground"
                      }`}
                    >
                      {entry.playerName}
                    </span>
                  </div>

                  {/* Score */}
                  <span
                    className={`text-right text-sm font-display font-bold ${
                      i === 0 ? "text-game-score" : "text-foreground"
                    }`}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Hidden admin reset */}
      <AnimatePresence>
        {showClear && entries.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <button
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 size={12} /> Reset Leaderboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;
