import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="logo-text text-xl tracking-tight flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          BRAHMAASTRA
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-all duration-200 relative group ${
                location.pathname === link.to
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 gradient-bg transition-all duration-300 ${
                location.pathname === link.to ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>
          ))}
        </nav>

        <Link
          to="/play"
          className="hidden md:inline-flex text-sm font-medium px-5 py-2 rounded-lg gradient-bg text-primary-foreground hover:opacity-90 transition-all duration-200 hover-lift"
        >
          Play Now
        </Link>

        <button
          className="md:hidden text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 pb-4 overflow-hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <Link
              to="/play"
              onClick={() => setOpen(false)}
              className="inline-flex mt-2 text-sm font-medium px-5 py-2.5 rounded-lg gradient-bg text-primary-foreground"
            >
              Play Now
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
