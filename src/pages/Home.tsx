import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Globe, Heart, ArrowRight, Rocket, Palette, Target, Sparkles } from "lucide-react";
import WaitlistSignup from "@/components/WaitlistSignup";
import SectionHeading from "@/components/SectionHeading";
import GameCard from "@/components/GameCard";
import { games } from "@/data/games";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6 } }),
};

const featuredGame = games.find((g) => g.featured)!;

const roadmap = [
  { icon: Sparkles, label: "Now", title: "Gilli Panda MVP", desc: "Playable in browser — power, angle, score!" },
  { icon: Target, label: "Next", title: "Leaderboards & Multiplayer", desc: "Compete with friends and climb the ranks." },
  { icon: Palette, label: "Soon", title: "New Game Titles", desc: "AutoRickshaw Rampage, Chai Tapper, and more." },
  { icon: Rocket, label: "Vision", title: "Brahmaastra Platform", desc: "A home for culturally inspired indie games." },
];

const Home = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        <motion.div initial="hidden" animate="visible" className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border/50 text-sm text-muted-foreground mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Indie Game Studio
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-6 leading-[1.1]">
            <span className="logo-text">Brahmaastra</span>
            <br />
            <span className="gradient-text">Indie Games</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
            Handcrafted games with desi soul and global fun
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/play/gilli-panda"
              className="group inline-flex items-center justify-center gap-2 text-base font-medium px-8 py-4 rounded-xl gradient-bg text-primary-foreground glow-primary hover:opacity-90 transition-all duration-300 hover-lift"
            >
              <span>🎮</span> Play Gilli Panda
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/games"
              className="btn-premium inline-flex items-center justify-center text-base font-medium px-8 py-4 rounded-xl bg-secondary border border-border/50 text-secondary-foreground hover:border-primary/30 transition-all duration-300"
            >
              Explore Games
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          </div>
        </motion.div>
      </section>

      {/* Featured Game */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
        <div className="container mx-auto max-w-5xl relative">
          <SectionHeading title="Featured Game" subtitle="Our flagship title — now playable in your browser" />
          <div className="max-w-xl mx-auto">
            <GameCard {...featuredGame} />
          </div>
        </div>
      </section>

      {/* Explore Games */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <SectionHeading title="Explore Games" subtitle="More titles in the works — stay tuned" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.filter((g) => !g.featured).slice(0, 3).map((game) => (
              <GameCard key={game.slug} {...game} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/games" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              View all games →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Play */}
      <section className="py-24 px-4 bg-card/20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeading title="Why Play Our Games?" subtitle="We build games that feel different" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Heart, title: "Made with Love", desc: "Every pixel crafted with passion by a small indie team." },
              { icon: Globe, title: "Desi Soul", desc: "Rooted in Indian culture, built for global audiences." },
              { icon: Zap, title: "Instant Play", desc: "No downloads. Jump right into the action in your browser." },
              { icon: Gamepad2, title: "Fun First", desc: "Simple to learn, endlessly replayable, genuinely fun." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={i}
                variants={fadeUp}
                className="card-glow bg-card border border-border/50 rounded-xl p-6 text-center hover:border-primary/20 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-bg text-primary-foreground mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Roadmap */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading title="Studio Roadmap" subtitle="Where we're headed" />
          <div className="grid sm:grid-cols-2 gap-5">
            {roadmap.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-card border border-border/50 rounded-xl p-6 flex gap-4 items-start hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg gradient-bg text-primary-foreground flex items-center justify-center">
                  <item.icon size={20} />
                </div>
                <div>
                  <span className="text-xs font-medium text-primary">{item.label}</span>
                  <h3 className="font-display text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-lg text-center">
          <SectionHeading title="Get Early Access" subtitle="Be first to play new games, unlock beta features, and get Gilli Panda updates." />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <WaitlistSignup />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
