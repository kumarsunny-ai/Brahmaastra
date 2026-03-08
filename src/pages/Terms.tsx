import SectionHeading from "@/components/SectionHeading";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const Terms = () => {
  useDocumentTitle("Terms of Use — Brahmaastra");
  return (
  <div className="min-h-screen pt-24 pb-16 px-4">
    <div className="container mx-auto max-w-2xl">
      <SectionHeading title="Terms of Use" gradient={false} />
      <div className="bg-card border border-border rounded-xl p-8 text-muted-foreground text-sm leading-relaxed space-y-4">
        <p><strong className="text-foreground">Last updated:</strong> March 2026</p>
        <p>By accessing and using the Brahmaastra website and games, you agree to these terms.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Use of Service</h3>
        <p>Our games are provided free for personal, non-commercial use. You may not reverse-engineer, redistribute, or commercially exploit our content without permission.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Intellectual Property</h3>
        <p>All game assets, code, designs, and branding are owned by Brahmaastra. You may not copy or reproduce them without written consent.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Disclaimer</h3>
        <p>Our games are provided "as is" without warranties. We're not liable for any damages arising from your use of our services.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Changes</h3>
        <p>We may update these terms at any time. Continued use constitutes acceptance of the updated terms.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Contact</h3>
        <p>Questions? Reach us at hello@brahmaastra.com.</p>
      </div>
    </div>
  </div>
  );
};

export default Terms;
