import { useState, useEffect, useRef, useCallback } from "react";
import pandaImg from "@/assets/panda-player.png";
import bgImg from "@/assets/game-bg.jpg";

type GamePhase = "idle" | "power" | "angle" | "flying" | "result";

const GilliDandaGame = () => {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("gilliPanda_highScore");
    return saved ? parseInt(saved) : 0;
  });
  const [gilliPos, setGilliPos] = useState({ x: 0, y: 0 });
  const [showGilli, setShowGilli] = useState(false);
  const animRef = useRef<number>(0);
  const powerDir = useRef(1);
  const angleDir = useRef(1);

  const startGame = useCallback(() => {
    setPhase("power");
    setPower(0);
    setAngle(45);
    setDistance(0);
    setShowGilli(false);
    setGilliPos({ x: 0, y: 0 });
  }, []);

  // Power oscillation
  useEffect(() => {
    if (phase !== "power") return;
    let val = 0;
    const tick = () => {
      val += powerDir.current * 2;
      if (val >= 100) { val = 100; powerDir.current = -1; }
      if (val <= 0) { val = 0; powerDir.current = 1; }
      setPower(val);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  // Angle oscillation
  useEffect(() => {
    if (phase !== "angle") return;
    let val = 45;
    const tick = () => {
      val += angleDir.current * 1.5;
      if (val >= 80) { val = 80; angleDir.current = -1; }
      if (val <= 10) { val = 10; angleDir.current = 1; }
      setAngle(val);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  // Flying animation
  useEffect(() => {
    if (phase !== "flying") return;
    setShowGilli(true);

    const maxDist = (power / 100) * (Math.sin((2 * angle * Math.PI) / 180)) * 300;
    const totalFrames = 90;
    let frame = 0;

    const tick = () => {
      frame++;
      const t = frame / totalFrames;
      const x = t * maxDist;
      const y = -Math.sin(t * Math.PI) * (power * 1.5) * Math.sin((angle * Math.PI) / 180);

      setGilliPos({ x, y });

      if (frame >= totalFrames) {
        const finalDist = Math.round(Math.abs(maxDist));
        setDistance(finalDist);
        if (finalDist > highScore) {
          setHighScore(finalDist);
          localStorage.setItem("gilliPanda_highScore", String(finalDist));
        }
        setPhase("result");
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, power, angle, highScore]);

  const handleTap = useCallback(() => {
    if (phase === "power") {
      cancelAnimationFrame(animRef.current);
      setPhase("angle");
    } else if (phase === "angle") {
      cancelAnimationFrame(animRef.current);
      setPhase("flying");
    }
  }, [phase]);

  const getScoreMessage = (dist: number) => {
    if (dist > 250) return "🏆 LEGENDARY HIT!";
    if (dist > 180) return "🔥 Amazing Shot!";
    if (dist > 100) return "💪 Great Hit!";
    if (dist > 50) return "👍 Not Bad!";
    return "😅 Try Again!";
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none" onClick={handleTap}>
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      <div className="absolute inset-0 bg-background/20" />

      {/* Title */}
      <div className="absolute top-4 left-0 right-0 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground drop-shadow-lg">
          Gilli Panda
        </h1>
        <p className="text-lg font-body text-muted-foreground mt-1">
          The ancient game of Gilli-Danda! 🎋
        </p>
      </div>

      {/* Score display */}
      <div className="absolute top-4 right-4 z-10">
        <div className="sketch-border bg-card/90 px-4 py-2 text-center">
          <p className="text-sm text-muted-foreground font-body">Best</p>
          <p className="text-3xl font-display font-bold text-game-score">{highScore}m</p>
        </div>
      </div>

      {/* Panda character */}
      <div className="absolute bottom-[18%] left-[8%] z-10">
        <img
          src={pandaImg}
          alt="Panda player"
          className="w-28 md:w-40 drop-shadow-lg"
          style={{
            transform: phase === "flying" ? "rotate(-15deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </div>

      {/* Gilli (the small stick) */}
      {showGilli && (
        <div
          className="absolute z-10 w-3 h-10 rounded-sm bg-game-gilli"
          style={{
            left: `calc(18% + ${gilliPos.x}px)`,
            bottom: `calc(28% + ${-gilliPos.y}px)`,
            transform: `rotate(${45 + gilliPos.x * 0.5}deg)`,
            boxShadow: "var(--shadow-sketch)",
          }}
        />
      )}

      {/* Power meter */}
      {phase === "power" && (
        <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 z-20 w-64">
          <p className="text-center text-2xl font-display font-bold text-foreground mb-2">
            ⚡ Set Power! Tap!
          </p>
          <div className="sketch-border bg-card/90 h-8 overflow-hidden">
            <div
              className="h-full bg-game-power transition-none"
              style={{ width: `${power}%` }}
            />
          </div>
          <p className="text-center text-xl font-display font-bold text-game-power mt-1">
            {Math.round(power)}%
          </p>
        </div>
      )}

      {/* Angle meter */}
      {phase === "angle" && (
        <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 z-20 w-64">
          <p className="text-center text-2xl font-display font-bold text-foreground mb-2">
            📐 Set Angle! Tap!
          </p>
          <div className="sketch-border bg-card/90 h-8 overflow-hidden">
            <div
              className="h-full bg-game-angle transition-none"
              style={{ width: `${(angle / 80) * 100}%` }}
            />
          </div>
          <p className="text-center text-xl font-display font-bold text-game-angle mt-1">
            {Math.round(angle)}°
          </p>
        </div>
      )}

      {/* Idle state */}
      {phase === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="sketch-border bg-card/95 px-8 py-6 text-center max-w-sm">
            <h2 className="text-4xl font-display font-bold text-foreground mb-3">Ready?</h2>
            <p className="text-lg font-body text-muted-foreground mb-4">
              Tap to set <span className="text-game-power font-bold">power</span>, then{" "}
              <span className="text-game-angle font-bold">angle</span> to launch the gilli!
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="sketch-btn bg-primary text-primary-foreground px-8 py-3 text-2xl"
            >
              🏏 Play!
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {phase === "result" && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="sketch-border bg-card/95 px-8 py-6 text-center max-w-sm">
            <p className="text-2xl font-display mb-2">{getScoreMessage(distance)}</p>
            <p className="text-6xl font-display font-bold text-game-score mb-1">{distance}m</p>
            <p className="text-lg font-body text-muted-foreground mb-4">
              Power: {Math.round(power)}% · Angle: {Math.round(angle)}°
            </p>
            {distance >= highScore && distance > 0 && (
              <p className="text-xl font-display text-accent font-bold mb-3">🌟 New Record!</p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="sketch-btn bg-primary text-primary-foreground px-8 py-3 text-2xl"
            >
              🏏 Again!
            </button>
          </div>
        </div>
      )}

      {/* Flying indicator */}
      {phase === "flying" && (
        <p className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl font-display font-bold text-foreground z-20 animate-bounce">
          🚀 Flying!
        </p>
      )}

      {/* Ground line */}
      <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-game-ground/60" />
    </div>
  );
};

export default GilliDandaGame;
