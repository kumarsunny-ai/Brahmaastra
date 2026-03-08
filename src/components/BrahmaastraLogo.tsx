import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BrahmaastraLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const textClass = size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-lg";

  return (
    <Link to="/" className={`logo-text ${textClass} tracking-tight relative group select-none inline-flex items-center gap-2`}>
      {/* Lightning bolt icon */}
      <svg width="22" height="26" viewBox="0 0 20 24" fill="none" className="flex-shrink-0">
        <defs>
          <linearGradient id="bolt-gradient" x1="2" y1="1" x2="18" y2="24">
            <stop offset="0%" stopColor="hsl(270, 95%, 65%)" />
            <stop offset="100%" stopColor="hsl(165, 82%, 55%)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M12 1L2 14h7l-1 9 10-13h-7l1-9z"
          stroke="url(#bolt-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#bolt-gradient)"
          animate={{
            filter: [
              "drop-shadow(0 0 4px rgba(23, 232, 180, 0.5))",
              "drop-shadow(0 0 10px rgba(23, 232, 180, 0.8))",
              "drop-shadow(0 0 4px rgba(23, 232, 180, 0.5))",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Full text */}
      <span className="relative text-foreground font-bold">
        BRAHMAASTRA

        {/* Electricity beam sweeping across */}
        <motion.span
          className="absolute top-1/2 -translate-y-1/2 h-[2px] w-8 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(165, 82%, 60%), hsl(270, 95%, 65%), transparent)",
            boxShadow: "0 0 8px rgba(23, 232, 180, 0.6)",
          }}
          animate={{ left: ["-20%", "120%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      </span>
    </Link>
  );
};

export default BrahmaastraLogo;
