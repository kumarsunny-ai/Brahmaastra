import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Bug, Play, Image } from "lucide-react";
import { getGameBySlug, statusConfig } from "@/data/games";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GameDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const game = slug ? getGameBySlug(slug) : undefined;

  if (!game) return <Navigate to="/games" replace />;

  const style = statusConfig[game.status];
  const isPlayable = game.status === "playable";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back link */}
        <Link to="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Games
        </Link>

        {/* Hero Banner */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative rounded-2xl overflow-hidden border border-primary/20 mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

          <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-8">
            <motion.div
              className="text-8xl md:text-[10rem]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {game.emoji}
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${isPlayable ? "animate-pulse" : ""}`} />
                  {game.statusLabel}
                </span>
                {game.featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full gradient-bg text-primary-foreground">
                    ✨ Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{game.title}</h1>
              <p className="text-muted-foreground max-w-lg leading-relaxed mb-4">{game.longDescription}</p>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {game.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full border border-border/60 text-muted-foreground bg-secondary/50">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {isPlayable && (
                  <Link
                    to={`/play/${game.slug}`}
                    className="group inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-xl gradient-bg text-primary-foreground hover:opacity-90 transition-all glow-primary"
                  >
                    <Play size={16} /> Play Now
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                <a
                  href="mailto:hello@brahmaastra.com?subject=Bug Report"
                  className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-xl border border-border/60 text-foreground bg-secondary/50 hover:bg-secondary transition-all"
                >
                  <Bug size={16} /> Report Bug
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How to Play */}
        {game.howToPlay && (
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">How to Play</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {game.howToPlay.map((step, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-xl p-5 flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Screenshots — Coming Soon */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Screenshots</h2>
          <div className="bg-card border border-border/50 rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">
              Screenshots and gameplay recordings are coming soon.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default GameDetail;
