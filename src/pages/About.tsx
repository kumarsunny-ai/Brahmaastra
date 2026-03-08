import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";
import { Target, Palette, Rocket } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <SectionHeading title="About Brahmaastra" subtitle="An indie studio on a mission to make games that matter." />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="prose prose-invert max-w-none mb-16">
          <div className="bg-card border border-border rounded-xl p-8 text-muted-foreground leading-relaxed space-y-4">
            <p>
              Brahmaastra is a small indie game studio building original, fun games inspired by Indian culture and designed for players everywhere.
            </p>
            <p>
              We believe the best games come from real stories, rich traditions, and a deep love for play. Our first title, <strong className="text-foreground">Gilli Panda</strong>, reimagines the ancient Indian sport of Gilli-Danda as a fun, fast browser game.
            </p>
            <p>
              We're just getting started — and we're building in public. Follow along as we craft more games, one handmade pixel at a time.
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Our Vision", desc: "Make games that celebrate Indian heritage while being universally fun and accessible." },
            { icon: Palette, title: "Design Philosophy", desc: "Simple mechanics, rich personality, instant delight. Every game should be easy to learn and hard to put down." },
            { icon: Rocket, title: "Roadmap", desc: "Gilli Panda is live. Multiplayer, leaderboards, and new titles are coming next." },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg gradient-bg text-primary-foreground mb-4">
                <item.icon size={22} />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
