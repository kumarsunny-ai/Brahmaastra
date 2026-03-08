import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Share2, Copy, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ScoreSubmitModalProps {
  open: boolean;
  score: number;
  isNewRecord: boolean;
  onSubmit: (name: string) => void;
  onSkip: () => void;
}

const SHARE_URL = "https://brahmaastra.com/play/gilli-panda";

const ScoreSubmitModal = ({ open, score, isNewRecord, onSubmit, onSkip }: ScoreSubmitModalProps) => {
  const [name, setName] = useState(() => localStorage.getItem("gilliPanda_playerName") || "");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shareText = `I scored ${score.toLocaleString()} in Gilli Panda on Brahmaastra! 🏏🔥 Can you beat me?`;

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setCopied(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || "Anonymous";
    localStorage.setItem("gilliPanda_playerName", trimmed);
    setSubmitted(true);
    trackEvent("leaderboard_submit", { score, playerName: trimmed });
    onSubmit(trimmed);
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${SHARE_URL}`);
      trackEvent("score_shared", { method: "clipboard", score });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = `${shareText}\n${SHARE_URL}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Gilli Panda — Brahmaastra",
          text: shareText,
          url: SHARE_URL,
        });
        trackEvent("score_shared", { method: "native", score });
      } catch {
        // User cancelled share — do nothing
      }
    } else {
      handleCopy();
    }
  }, [shareText, handleCopy]);

  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

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
            <p className="text-sm text-muted-foreground mb-6">
              {submitted ? "Score saved!" : "You made the leaderboard!"}
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/50 text-foreground text-center font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  onKeyDown={(e) => e.stopPropagation()}
                />
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
            ) : (
              /* Share section after submit */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                {/* Share text preview */}
                <div className="bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-left">
                  <p className="text-sm text-foreground leading-relaxed">{shareText}</p>
                  <p className="text-xs text-muted-foreground mt-1">{SHARE_URL}</p>
                </div>

                {/* Share buttons */}
                <div className="flex gap-2">
                  {supportsNativeShare && (
                    <button
                      onClick={handleShare}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-bg text-primary-foreground font-medium glow-primary hover:opacity-90 transition-all"
                    >
                      <Share2 size={16} /> Share
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      copied
                        ? "bg-accent/20 border border-accent/30 text-accent"
                        : "bg-secondary border border-border/50 text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {copied ? (
                      <><Check size={16} /> Copied!</>
                    ) : (
                      <><Copy size={16} /> Copy</>
                    )}
                  </button>
                </div>

                {/* Play again */}
                <button
                  onClick={onSkip}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
                >
                  Continue →
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScoreSubmitModal;
