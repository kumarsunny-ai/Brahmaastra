import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Globe, Heart } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import GameCard from "@/components/GameCard";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Home = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-3xl mx-auto"
        >
          <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-sm text-muted-foreground mb-8">
            <Gamepad2 size={14} />
            Indie Game Studio
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            Brahmaastra{" "}
            <span className="gradient-text">Indie Games</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Handcrafted games with desi soul and global fun
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/play"
              className="inline-flex items-center justify-center text-base font-medium px-8 py-3.5 rounded-xl gradient-bg text-primary-foreground glow-primary hover:opacity-90 transition-all"
            >
              🎮 Play Gilli Panda
            </Link>
            <Link
              to="/games"
              className="inline-flex items-center justify-center text-base font-medium px-8 py-3.5 rounded-xl bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 transition-all"
            >
              Explore Games
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Game */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading title="Featured Game" subtitle="Our flagship title — now playable in your browser" />
          <div className="max-w-md mx-auto">
            <GameCard
              title="Gilli Panda"
              description="A mythic twist on India's timeless Gilli-Danda. Time your swings, launch the gilli sky-high, and chase legendary distances!"
              status="live"
              ctaLabel="Play Now"
              ctaLink="/play"
              emoji="🏏"
              featured
            />
          </div>
        </div>
      </section>

      {/* Why Play */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-5xl">
          <SectionHeading title="Why Play Our Games?" subtitle="We build games that feel different" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg gradient-bg text-primary-foreground mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-lg text-center">
          <SectionHeading title="Stay in the Loop" subtitle="Get updates on new games, features, and tournaments." />
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="px-6 py-3 rounded-lg gradient-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Join
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
