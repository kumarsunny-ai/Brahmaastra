import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Loader2, Home, Gamepad2, Bug, Play as PlayIcon, Keyboard, Monitor } from "lucide-react";
import GilliDandaGame from "@/components/GilliDandaGame";
import { getGameBySlug } from "@/data/games";

const Play = () => {
  const { slug } = useParams<{ slug: string }>();
  const resolvedSlug = slug || "gilli-panda";
  const game = getGameBySlug(resolvedSlug);
  const [gameStarted, setGameStarted] = useState(false);

  const isSupported = typeof window !== "undefined" && !!window.requestAnimationFrame && !!window.HTMLCanvasElement;

  // Unsupported browser
  if (!isSupported) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md">
          <Monitor size={40} className="text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Browser Not Supported</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your browser doesn't support the features needed to run this game. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
          </p>
          <Link to="/" className="text-sm text-primary hover:text-primary/80 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Game not found
  if (!game) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md">
          <AlertTriangle size={40} className="text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Game Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">We couldn't find the game you're looking for.</p>
          <Link to="/games" className="text-sm text-primary hover:text-primary/80 font-medium">
            ← Browse Games
          </Link>
        </div>
      </div>
    );
  }

  const isGilliPanda = resolvedSlug === "gilli-panda";
  const isPlayable = game.status === "playable";

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Nav Bar */}
      <div className="bg-card/60 backdrop-blur-sm border-b border-border/50 sticky top-16 z-40">
        <div className="container mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/games"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Games
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home size={14} /> Home
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-display font-bold text-foreground">{game.emoji} {game.title}</span>
          </div>
          <a
            href="mailto:bugs@brahmaastra.com?subject=Bug Report: Gilli Panda"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bug size={14} /> Report Bug
          </a>
        </div>
      </div>

      {/* Game Container */}
      <div className="container mx-auto max-w-5xl px-4 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl border border-border/50 bg-card overflow-hidden"
          style={{ minHeight: "520px" }}
        >
          {isGilliPanda && isPlayable ? (
            gameStarted ? (
              <GilliDandaGame />
            ) : (
              /* Start Screen */
              <div className="flex flex-col items-center justify-center h-full min-h-[520px] gap-6 px-4">
                <motion.div
                  className="text-7xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {game.emoji}
                </motion.div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center">
                  {game.title}
                </h2>
                <p className="text-muted-foreground text-center max-w-md">
                  {game.description}
                </p>
                <button
                  onClick={() => setGameStarted(true)}
                  className="group inline-flex items-center gap-2 text-base font-medium px-8 py-4 rounded-xl gradient-bg text-primary-foreground glow-primary hover:opacity-90 transition-all duration-300"
                >
                  <PlayIcon size={20} fill="currentColor" /> Start Game
                </button>
              </div>
            )
          ) : (
            /* Not-ready placeholder */
            <div className="flex flex-col items-center justify-center h-full min-h-[520px] gap-6 px-4">
              <motion.div
                className="text-7xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {game.emoji}
              </motion.div>
              <Loader2 size={28} className="animate-spin text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground text-center">
                {game.title}
              </h2>
              <p className="text-muted-foreground text-center max-w-sm">
                Playable build coming soon. This game is currently <strong className="text-foreground">{game.statusLabel.toLowerCase()}</strong>.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Link
                  to="/games"
                  className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl bg-secondary border border-border/50 text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  <Gamepad2 size={16} /> Back to Games
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl bg-secondary border border-border/50 text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  <Home size={16} /> Back to Home
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* Game Controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Keyboard size={18} className="text-primary" /> Game Controls
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <span className="text-foreground font-medium text-sm">Tap / Click</span>
              <p className="text-muted-foreground text-xs mt-1">Set power and angle to launch the gilli</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <span className="text-foreground font-medium text-sm">Timing</span>
              <p className="text-muted-foreground text-xs mt-1">Watch the meters — time your taps for max distance</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <span className="text-foreground font-medium text-sm">Goal</span>
              <p className="text-muted-foreground text-xs mt-1">Beat your high score and chase legendary distances</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Play;
