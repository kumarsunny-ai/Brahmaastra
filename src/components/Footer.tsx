const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-lg font-bold gold-gradient-text tracking-widest">
            BRAHMAASTRA
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-body transition-colors">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-body transition-colors">Discord</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-body transition-colors">Instagram</a>
          </div>
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()} Brahmaastra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
