import { Link } from "react-router-dom";
import BrahmaastraLogo from "./BrahmaastraLogo";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/20">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="mb-3">
              <BrahmaastraLogo size="sm" />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              An indie game studio crafting handcrafted games with desi soul and global fun.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Pages</h4>
            <nav className="flex flex-col gap-2.5" aria-label="Footer pages">
              <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Home</Link>
              <Link to="/games" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Games</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Contact</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Legal</h4>
            <nav className="flex flex-col gap-2.5" aria-label="Footer legal">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Terms of Use</Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Brahmaastra. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Socials coming soon — stay tuned.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
