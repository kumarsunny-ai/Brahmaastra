import SectionHeading from "@/components/SectionHeading";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const Privacy = () => {
  useDocumentTitle("Privacy Policy — Brahmaastra");
  return (
  <div className="min-h-screen pt-24 pb-16 px-4">
    <div className="container mx-auto max-w-2xl">
      <SectionHeading title="Privacy Policy" gradient={false} />
      <div className="bg-card border border-border rounded-xl p-8 text-muted-foreground text-sm leading-relaxed space-y-4">
        <p><strong className="text-foreground">Last updated:</strong> March 2026</p>
        <p>Brahmaastra ("we", "our", "us") respects your privacy. This policy explains how we collect, use, and protect your information when you use our website and games.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Information We Collect</h3>
        <p>We may collect your email address when you sign up for our newsletter or contact us. We also collect anonymous usage data (e.g., pages visited, game scores) to improve our products.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">How We Use Your Data</h3>
        <p>We use your data solely to communicate with you, improve our games, and provide a better experience. We do not sell your personal data to third parties.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Cookies</h3>
        <p>We may use minimal cookies and local storage for game progress. No third-party tracking cookies are used.</p>
        <h3 className="font-display text-foreground font-semibold text-base pt-2">Contact</h3>
        <p>For privacy-related inquiries, email us at hello@brahmaastra.com.</p>
      </div>
    </div>
  );
};

export default Privacy;
