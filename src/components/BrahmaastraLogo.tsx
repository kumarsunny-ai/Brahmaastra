import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BrahmaastraLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const textClass = size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-lg";

  return (
    <Link to="/" className={`logo-text ${textClass} tracking-tight flex items-center gap-0 relative group select-none`}>
      {/* Lightning bolt icon */}
      <motion.span
        className="relative z-10 mr-1"
        animate={{ 
          textShadow: [
            "0 0 8px hsl(165 82% 50% / 0.6)",
            "0 0 20px hsl(165 82% 50% / 0.9)",
            "0 0 8px hsl(165 82% 50% / 0.6)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="inline-block">
          <motion.path
            d="M12 1L2 14h7l-1 9 10-13h-7l1-9z"
            stroke="url(#bolt-grad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#bolt-grad)"
            initial={{ filter: "drop-shadow(0 0 4px hsl(165 82% 50% / 0.5))" }}
            animate={{
              filter: [
                "drop-shadow(0 0 4px hsl(165 82% 50% / 0.5))",
                "drop-shadow(0 0 12px hsl(165 82% 50% / 0.9))",
                "drop-shadow(0 0 4px hsl(165 82% 50% / 0.5))",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="bolt-grad" x1="2" y1="1" x2="18" y2="24">
              <stop offset="0%" stopColor="hsl(270 95% 65%)" />
              <stop offset="100%" stopColor="hsl(165 82% 55%)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.span>

      {/* BRAHM text */}
      <span className="relative z-10">BRAHM</span>

      {/* Animated electricity slash between BRAHM and AASTRA */}
      <span className="relative inline-flex items-center mx-0 w-6 h-full overflow-visible">
        {/* The slash/arrow */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width="24"
          height="32"
          viewBox="0 0 24 32"
          fill="none"
        >
          {/* Static arrow shape */}
          <motion.path
            d="M4 28 L12 4 L14 12 L20 4 L12 28 L10 20 L4 28Z"
            fill="url(#slash-grad)"
            initial={{ opacity: 0.7 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              filter: [
                "drop-shadow(0 0 2px hsl(165 82% 50% / 0.4))",
                "drop-shadow(0 0 8px hsl(165 82% 50% / 0.9))",
                "drop-shadow(0 0 2px hsl(165 82% 50% / 0.4))",
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Electric sparks */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={10 + i * 2}
              cy={12 + i * 4}
              r="1"
              fill="hsl(165 82% 70%)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Electricity arc lines */}
          <motion.path
            d="M8 10 Q12 14 10 18 Q14 16 12 22"
            stroke="hsl(165 82% 60%)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M14 8 Q10 12 14 16 Q10 18 14 24"
            stroke="hsl(270 95% 70%)"
            strokeWidth="0.6"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
          />

          <defs>
            <linearGradient id="slash-grad" x1="4" y1="28" x2="20" y2="4">
              <stop offset="0%" stopColor="hsl(270 95% 60%)" />
              <stop offset="50%" stopColor="hsl(200 90% 60%)" />
              <stop offset="100%" stopColor="hsl(165 82% 55%)" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      {/* AASTRA text */}
      <span className="relative z-10">AASTRA</span>

      {/* Horizontal electricity beam running through the whole text */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-[2px] w-8"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(165 82% 60%), hsl(270 95% 65%), transparent)",
            boxShadow: "0 0 12px hsl(165 82% 50% / 0.6), 0 0 4px hsl(270 95% 60% / 0.4)",
          }}
          animate={{
            left: ["-20%", "120%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Subtle glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: "radial-gradient(ellipse at center, hsl(270 95% 60% / 0.08), transparent 70%)",
        }}
      />
    </Link>
  );
};

export default BrahmaastraLogo;
