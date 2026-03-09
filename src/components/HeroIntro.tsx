import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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

/* Floating game elements for the animated background */
const floatingElements = [
  { emoji: "🏏", x: "10%", y: "15%", size: 48, dur: 6, del: 0 },
  { emoji: "🔮", x: "85%", y: "20%", size: 40, dur: 7, del: 0.5 },
  { emoji: "🛺", x: "75%", y: "70%", size: 52, dur: 5.5, del: 1 },
  { emoji: "☕", x: "15%", y: "75%", size: 36, dur: 8, del: 0.3 },
  { emoji: "📦", x: "50%", y: "85%", size: 32, dur: 6.5, del: 0.8 },
  { emoji: "🚇", x: "90%", y: "50%", size: 44, dur: 7.5, del: 0.2 },
  { emoji: "🎯", x: "25%", y: "45%", size: 28, dur: 9, del: 1.2 },
  { emoji: "🪁", x: "65%", y: "30%", size: 36, dur: 6, del: 0.6 },
  { emoji: "🎲", x: "40%", y: "65%", size: 30, dur: 8, del: 0.4 },
  { emoji: "✨", x: "55%", y: "15%", size: 24, dur: 5, del: 0.9 },
];

/* Particles that drift across the scene */
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 8 + 6,
  del: Math.random() * 3,
  isPrimary: Math.random() > 0.5,
}));

const HeroIntro = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const bgOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3], [0.3, 0.85]);

  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

        {/* === CINEMATIC ANIMATED BACKGROUND === */}
        <motion.div
          style={{ scale: bgScale, opacity: bgOpacity }}
          className="absolute inset-0 z-0"
        >
          {/* Base image with Ken Burns zoom */}
          <motion.img
            src={heroCollage}
            alt="Indian street games collage"
            className="w-full h-full object-cover"
            initial={{ scale: 1.2, filter: "blur(8px) brightness(0.3)" }}
            animate={{ scale: 1, filter: "blur(0px) brightness(0.6)" }}
            transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Animated vignette */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            style={{
              background: "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)) 85%)",
            }}
          />

          {/* Floating game emojis */}
          {floatingElements.map((el, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none select-none"
              style={{ left: el.x, top: el.y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0.4, 0.6],
                scale: [0, 1, 0.9, 1],
                y: [0, -20, 10, -15, 0],
                rotate: [0, 5, -5, 3, 0],
              }}
              transition={{
                opacity: { delay: el.del + 1, duration: 1.5 },
                scale: { delay: el.del + 1, duration: 0.8, type: "spring" },
                y: { delay: el.del + 2, duration: el.dur, repeat: Infinity, ease: "easeInOut" },
                rotate: { delay: el.del + 2, duration: el.dur * 1.2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <span
                style={{ fontSize: el.size }}
                className="drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                {el.emoji}
              </span>
            </motion.div>
          ))}

          {/* Drifting particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: p.isPrimary
                  ? "hsl(var(--primary) / 0.6)"
                  : "hsl(var(--accent) / 0.5)",
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.8, 0.3, 0.7, 0],
                y: [0, -60, -120],
                x: [0, (Math.random() - 0.5) * 40],
              }}
              transition={{
                duration: p.dur,
                delay: p.del + 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Animated light sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.3) 50%, transparent 60%)",
            }}
          />
        </motion.div>

        {/* Dark overlay */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 z-[1] bg-background"
        />

        {/* Animated grid lines */}
        <div className="absolute inset-0 z-[2] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

        {/* Animated glow orbs */}
        <motion.div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[180px] z-[2]"
          style={{ background: "hsl(var(--primary) / 0.12)" }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full blur-[150px] z-[2]"
          style={{ background: "hsl(var(--accent) / 0.1)" }}
          animate={{ x: [0, -25, 20, 0], y: [0, 25, -15, 0], scale: [1, 0.95, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* === CONTENT === */}
        <motion.div style={{ y: textY }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 border border-border/40 text-sm text-muted-foreground mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Indie Game Studio — India
          </motion.div>

          {/* Main title - cinematic reveal */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-display font-bold leading-[0.9] tracking-tight"
            >
              <span className="logo-text">Brahmaastra</span>
            </motion.h1>
          </div>

          {/* Subtitle with typewriter-like stagger */}
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light mb-6 tracking-tight"
            >
              Desi Soul. Global Fun.
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-base md:text-lg text-muted-foreground/70 mb-10 max-w-lg mx-auto"
          >
            Handcrafted browser games inspired by Indian culture.
            <br className="hidden sm:block" />
            No downloads. Just play.
          </motion.p>

          {/* Game showcase pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {gameShowcase.map((game) => (
              <motion.span
                key={game.name}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: game.delay + 0.8,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{ scale: 1.08, borderColor: "hsl(var(--primary) / 0.5)" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/40 text-sm text-foreground backdrop-blur-sm transition-colors cursor-default"
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
            transition={{ delay: 2.0, duration: 0.6 }}
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
        <AnimatePresence>
          {introComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HeroIntro;
