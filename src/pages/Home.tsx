import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Gamepad2, Zap, Globe, Heart, Code2, Users, Flame } from "lucide-react";
import HeroIntro from "@/components/HeroIntro";
import ScrollShowcase from "@/components/ScrollShowcase";
import WaitlistSignup from "@/components/WaitlistSignup";
import SectionHeading from "@/components/SectionHeading";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { trackEvent } from "@/lib/analytics";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6 } }),
};

const philosophy = [
  { icon: Flame, title: "Culture Meets Play", desc: "We draw from rich Indian traditions and reimagine them as games the whole world can enjoy." },
  { icon: Code2, title: "Browser-First", desc: "No app stores, no installs. Every game runs instantly in your browser — on any device." },
  { icon: Users, title: "Community Driven", desc: "Players shape our roadmap. We build what excites you, together." },
];

const Home = () => {
  useDocumentTitle("Brahmaastra — Indie Games with Desi Soul & Global Fun");
  useEffect(() => { trackEvent("homepage_view"); }, []);

  return (
    <div className="min-h-screen">
      {/* Apple-style animated hero with background image */}
      <HeroIntro />

      {/* Scroll-animated game showcase */}
      <ScrollShowcase />

      {/* Studio Philosophy - Apple-style large text reveal */}
      <PhilosophySection philosophy={philosophy} />

      {/* Why Play - Feature grid */}
      <section className="py-24 md:py-32 px-4 bg-card/20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeading title="Why Play Our Games?" subtitle="Simple, fun, and built different" />
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
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <SectionHeading title="Studio Roadmap" subtitle="Our game pipeline at a glance" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Playable Now", color: "bg-accent", games: [{ emoji: "🏏", title: "Gilli Panda", slug: "gilli-panda" }, { emoji: "🛺", title: "AutoRickshaw Rampage", slug: "autorickshaw-rampage" }, { emoji: "🔮", title: "Kancha Masters", slug: "kancha-masters" }] },
              { label: "In Development", color: "bg-primary", games: [{ emoji: "☕", title: "Chai Tapper", slug: "chai-tapper" }, { emoji: "📦", title: "Dabba Dash", slug: "dabba-dash" }] },
              { label: "Coming Soon", color: "bg-muted-foreground", games: [{ emoji: "🚇", title: "Metro Surfers", slug: "metro-surfers" }] },
            ].map((group, gi) => (
              <motion.div
                key={group.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={gi}
                variants={fadeUp}
                className="bg-card border border-border/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className={`w-2.5 h-2.5 rounded-full ${group.color}`} />
                  <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wide">{group.label}</h3>
                </div>
                <div className="space-y-3">
                  {group.games.map((game) => (
                    <Link
                      key={game.slug}
                      to={`/play/${game.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/30 hover:border-primary/30 transition-all duration-200 group"
                    >
                      <span className="text-2xl">{game.emoji}</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{game.title}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-lg text-center">
          <SectionHeading title="Join the Studio" subtitle="Be first to play new games, unlock beta features, and get updates from Brahmaastra." />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <WaitlistSignup />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

/* Apple-style philosophy section with scroll-driven text opacity */
const PhilosophySection = ({ philosophy }: { philosophy: typeof philosophy_placeholder }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.1, 0.3], [60, 0]);

  return (
    <section ref={ref} className="py-24 md:py-40 px-4 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="container mx-auto max-w-5xl relative">
        <motion.div style={{ opacity: titleOpacity, y: titleY }} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-4">
            The Brahmaastra Way
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Why we build games differently
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {philosophy.map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={i}
              variants={fadeUp}
              className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:border-primary/20 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg text-primary-foreground mb-5">
                <item.icon size={26} />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Type placeholder for the philosophy section
const philosophy_placeholder = [
  { icon: Flame, title: "", desc: "" },
];

export default Home;
