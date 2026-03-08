import { Link } from "react-router-dom";

const BrahmaastraLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const textClass = size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-base";

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 select-none group ${textClass}`}
    >
      {/* Lightning bolt accent */}
      <svg
        width={size === "lg" ? 24 : size === "md" ? 20 : 16}
        height={size === "lg" ? 28 : size === "md" ? 24 : 20}
        viewBox="0 0 20 24"
        fill="none"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="bolt-grad" x1="2" y1="1" x2="18" y2="24">
            <stop offset="0%" stopColor="hsl(270, 95%, 65%)" />
            <stop offset="100%" stopColor="hsl(165, 82%, 55%)" />
          </linearGradient>
        </defs>
        <path
          d="M12 1L2 14h7l-1 9 10-13h-7l1-9z"
          fill="url(#bolt-grad)"
          stroke="url(#bolt-grad)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Clear readable wordmark */}
      <span className="font-display font-bold tracking-wide text-foreground">
        BRAHMAASTRA
      </span>
    </Link>
  );
};

export default BrahmaastraLogo;
