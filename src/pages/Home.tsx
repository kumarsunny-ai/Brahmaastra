import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 cinematic-gradient opacity-70" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold gold-gradient-text mb-6 leading-tight">
            BRAHMAASTRA
          </h1>
          <p className="text-lg md:text-xl font-body text-foreground/80 mb-10 max-w-xl mx-auto">
            Unleash the ancient power. Play the legendary Gilli Panda — a mythic twist on India's timeless Gilli-Danda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg" className="text-lg px-10 py-6">
              <Link to="/play">⚡ Play Now</Link>
            </Button>
            <Button asChild variant="heroOutline" size="lg" className="text-lg px-10 py-6">
              <a href="#waitlist">🔔 Join Waitlist</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center gold-gradient-text mb-16">
            Why Brahmaastra?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🏏", title: "Ancient Sport", desc: "Gilli-Danda reimagined with a cosmic panda warrior." },
              { icon: "🎮", title: "Instant Play", desc: "No downloads. Play instantly in your browser." },
              { icon: "🏆", title: "Compete", desc: "Beat your best score and challenge friends." },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{f.title}</h3>
                <p className="font-body text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-24 px-4 bg-card/50">
        <div className="container mx-auto max-w-lg text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold gold-gradient-text mb-4">
            Join the Waitlist
          </h2>
          <p className="font-body text-muted-foreground mb-8">
            Be the first to unlock new levels, characters, and tournaments.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-secondary border border-border rounded-md px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="hero" className="px-6">Join</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
