import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <p className="font-display text-lg font-bold gradient-text mb-2">BRAHMAASTRA</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              An indie game studio crafting handcrafted games with desi soul and global fun.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-3">Pages</h4>
            <div className="flex flex-col gap-2">
              <Link to="/games" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Games</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Use</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Brahmaastra. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors" aria-label="Twitter">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors" aria-label="Discord">Discord</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors" aria-label="Instagram">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
