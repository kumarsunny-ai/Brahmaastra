const About = () => {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold gold-gradient-text mb-8 text-center">
            About Brahmaastra
          </h1>
          <div className="space-y-6 font-body text-lg text-foreground/80 leading-relaxed">
            <p>
              <strong className="text-gold">Brahmaastra</strong> is a browser-based game inspired by 
              <strong className="text-ember"> Gilli-Danda</strong> — one of India's oldest traditional sports, 
              played across villages for centuries.
            </p>
            <p>
              In this mythic reimagining, you play as <strong className="text-gold">Gilli Panda</strong>, a cosmic 
              panda warrior wielding the legendary Danda. Time your power and angle to launch the Gilli 
              across ancient battlegrounds and set legendary distance records.
            </p>
            <p>
              Our mission is to bring traditional Indian games to the modern world, preserving cultural 
              heritage through fun, accessible gameplay that anyone can enjoy — no downloads required.
            </p>

            <div className="bg-card border border-border rounded-lg p-8 mt-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">How to Play</h2>
              <ol className="list-decimal list-inside space-y-3 text-foreground/80">
                <li><strong className="text-gold">Tap once</strong> — Set your power (watch the meter oscillate)</li>
                <li><strong className="text-gold">Tap again</strong> — Set your angle of launch</li>
                <li><strong className="text-gold">Watch</strong> — The Gilli flies! Distance depends on your timing</li>
                <li><strong className="text-gold">Beat your record</strong> — High scores are saved locally</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
