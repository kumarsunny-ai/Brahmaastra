import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroCollage from "@/assets/hero-collage.jpg";

const gameShowcase = [
  { emoji: "🏏", name: "Gilli Panda", delay: 0.3 },
  { emoji: "🛺", name: "AutoRickshaw Rampage", delay: 0.5 },
  { emoji: "☕", name: "Chai Tapper", delay: 0.7 },
  { emoji: "📦", name: "Dabba Dash", delay: 0.9 },
  { emoji: "🚇", name: "Metro Surfers", delay: 1.1 },
  { emoji: "🔮", name: "Kancha Masters", delay: 1.3 },
];

const HeroIntro = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 0.85]);
  const imageOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3], [0.55, 0.8]);

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      {/* Sticky hero container */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Background image with parallax */}
        <motion.div
          style={{ scale: imageScale, opacity: imageOpacity }}
          className="absolute inset-0 z-0"
        >
          <img
            src={heroCollage}
            alt="Indian street games collage featuring marbles, gilli danda, auto rickshaws, chai, and dabbawalas"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Dark overlay */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 z-[1] bg-background"
        />

        {/* Animated grid lines (Apple-style) */}
        <div className="absolute inset-0 z-[2] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[180px] z-[2]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[150px] z-[2]" />

        {/* Content */}
        <motion.div style={{ y: textY }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 border border-border/40 text-sm text-muted-foreground mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Indie Game Studio — India
          </motion.div>

          {/* Main title - Apple-style large typography */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-display font-bold leading-[0.9] mb-4 tracking-tight"
          >
            <span className="logo-text">Brahmaastra</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light mb-6 tracking-tight"
          >
            Desi Soul. Global Fun.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-base md:text-lg text-muted-foreground/70 mb-10 max-w-lg mx-auto"
          >
            Handcrafted browser games inspired by Indian culture.
            <br className="hidden sm:block" />
            No downloads. Just play.
          </motion.p>

          {/* Game showcase pills - animated entrance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {gameShowcase.map((game) => (
              <motion.span
                key={game.name}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: game.delay,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/40 text-sm text-foreground backdrop-blur-sm hover:border-primary/40 transition-colors cursor-default"
              >
                <span className="text-lg">{game.emoji}</span>
                <span className="hidden sm:inline">{game.name}</span>
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/play/gilli-panda"
              className="group inline-flex items-center justify-center gap-2 text-base font-medium px-8 py-4 rounded-2xl gradient-bg text-primary-foreground glow-primary hover:opacity-90 transition-all duration-300 hover-lift"
            >
              <span>🏏</span> Play Now
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/games"
              className="inline-flex items-center justify-center text-base font-medium px-8 py-4 rounded-2xl bg-secondary/80 border border-border/50 text-secondary-foreground hover:border-primary/30 backdrop-blur-sm transition-all duration-300"
            >
              Explore All Games
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroIntro;
