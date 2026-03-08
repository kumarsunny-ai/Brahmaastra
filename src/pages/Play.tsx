import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import GilliDandaGame from "@/components/GilliDandaGame";
import { getGameBySlug } from "@/data/games";

const Play = () => {
  const { slug } = useParams<{ slug: string }>();
  const resolvedSlug = slug || "gilli-panda";
  const game = getGameBySlug(resolvedSlug);

  // Unsupported browser check
  const isSupported = typeof window !== "undefined" && !!window.requestAnimationFrame;

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle size={40} className="text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Browser Not Supported</h2>
          <p className="text-muted-foreground text-sm">
            Please use a modern browser like Chrome, Firefox, Safari, or Edge to play.
          </p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-md">
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Game Not Found</h2>
          <p className="text-muted-foreground text-sm mb-4">We couldn't find the game you're looking for.</p>
          <Link to="/games" className="text-sm text-primary hover:text-primary/80 font-medium">
            ← Browse Games
          </Link>
        </div>
      </div>
    );
  }

  // Gilli Panda is the only playable game right now
  if (resolvedSlug === "gilli-panda") {
    return (
      <div className="relative">
        <Link
          to={`/games/${resolvedSlug}`}
          className="absolute top-4 left-4 z-50 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Details
        </Link>
        <GilliDandaGame />

        {/* Controls section */}
        <div className="bg-background border-t border-border/50 px-4 py-8">
          <div className="container mx-auto max-w-2xl">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Controls</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <span className="text-foreground font-medium">Tap / Click</span>
                <p className="text-muted-foreground text-xs mt-1">Set power, then angle to launch</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <span className="text-foreground font-medium">Timing</span>
                <p className="text-muted-foreground text-xs mt-1">Watch the meters and time your taps for max distance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder for games not yet built
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-md">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <Loader2 size={24} className="animate-spin text-primary mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">{game.title}</h2>
        <p className="text-muted-foreground text-sm mb-4">
          This game is currently <strong className="text-foreground">{game.statusLabel.toLowerCase()}</strong>. The playable build isn't ready yet.
        </p>
        <Link to={`/games/${game.slug}`} className="text-sm text-primary hover:text-primary/80 font-medium">
          ← View Game Details
        </Link>
      </div>
    </div>
  );
};

export default Play;
