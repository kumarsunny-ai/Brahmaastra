import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/20">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="logo-text text-lg flex items-center gap-2 mb-3">
              <span className="text-xl">⚡</span>
              BRAHMAASTRA
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              An indie game studio crafting handcrafted games with desi soul and global fun.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Pages</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/games" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Games</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-4">Legal</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Terms of Use</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Brahmastra. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200" aria-label="Twitter">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200" aria-label="Discord">Discord</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200" aria-label="Instagram">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
