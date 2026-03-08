import GameCard from "@/components/GameCard";
import SectionHeading from "@/components/SectionHeading";

const games = [
  {
    title: "Gilli Panda",
    description: "A mythic twist on India's timeless Gilli-Danda. Time your swings and chase legendary distances!",
    status: "live" as const,
    ctaLabel: "Play Now",
    ctaLink: "/play",
    emoji: "🏏",
    featured: true,
  },
  {
    title: "Chakravyuh Run",
    description: "Navigate the ancient spiral maze in this endless runner inspired by Mahabharata.",
    status: "coming-soon" as const,
    ctaLabel: "Coming Soon",
    ctaLink: "#",
    emoji: "🌀",
  },
  {
    title: "Kabaddi Clash",
    description: "Fast-paced multiplayer kabaddi action. Raid, defend, and outsmart your opponents.",
    status: "coming-soon" as const,
    ctaLabel: "Coming Soon",
    ctaLink: "#",
    emoji: "⚡",
  },
];

const Games = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <SectionHeading title="Our Games" subtitle="Handcrafted experiences rooted in Indian culture" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
