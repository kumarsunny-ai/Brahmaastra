import { useEffect, useRef, useCallback, useState } from "react";
import { trackEvent } from "@/lib/analytics";

/* ─── Types ─── */
type Phase = "ready" | "playing" | "hit" | "miss" | "gameover";

interface Gilli {
  x: number;
  y: number;
  speed: number;
  angle: number; // radians, trajectory angle
  rotation: number;
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

/* ─── Constants ─── */
const CANVAS_W = 800;
const CANVAS_H = 520;
const GROUND_Y = 420;
const BAT_X = 140;
const BAT_W = 12;
const BAT_H = 90;
const STRIKE_ZONE_X = BAT_X - 10;
const STRIKE_ZONE_W = 50;
const GILLI_W = 8;
const GILLI_H = 36;
const MAX_LIVES = 3;
const GILLI_SPAWN_X = CANVAS_W + 40;

/* ─── Colors (resolved from CSS vars at runtime) ─── */
function getCSSColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? `hsl(${val})` : fallback;
}

interface GilliDandaGameProps {
  onGameOver?: (score: number) => void;
}

/* ─── Main Component ─── */
const GilliDandaGame = ({ onGameOver }: GilliDandaGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    phase: "ready" as Phase,
    score: 0,
    combo: 0,
    lives: MAX_LIVES,
    bestScore: parseInt(localStorage.getItem("gilliPanda_best") || "0"),
    gilli: null as Gilli | null,
    spawnTimer: 0,
    spawnInterval: 90, // frames
    gilliSpeed: 3.5,
    batSwing: 0, // 0 = idle, >0 = swinging animation frames
    particles: [] as Particle[],
    flashTimer: 0,
    flashColor: "",
    hitMessage: "",
    hitMessageTimer: 0,
    frameCount: 0,
    difficulty: 1,
  });

  const [uiPhase, setUiPhase] = useState<Phase>("ready");
  const [uiScore, setUiScore] = useState(0);
  const [uiBest, setUiBest] = useState(stateRef.current.bestScore);

  /* ─── Resolve theme colors ─── */
  const colorsRef = useRef({
    sky: "#1a1a2e",
    ground: "#2d4a2d",
    bat: "#b8860b",
    gilli: "#d4a855",
    strike: "#10b981",
    miss: "#ef4444",
    score: "#fbbf24",
    fg: "#fafafa",
    muted: "#6b7280",
    card: "#1e1e2e",
    primary: "#8b5cf6",
    accent: "#10b981",
    bg: "#0a0a0f",
  });

  useEffect(() => {
    const c = colorsRef.current;
    c.sky = getCSSColor("--game-sky", c.sky);
    c.ground = getCSSColor("--game-ground", c.ground);
    c.bat = getCSSColor("--game-bat", c.bat);
    c.gilli = getCSSColor("--game-gilli", c.gilli);
    c.strike = getCSSColor("--game-strike", c.strike);
    c.miss = getCSSColor("--game-miss", c.miss);
    c.score = getCSSColor("--game-score", c.score);
    c.fg = getCSSColor("--foreground", c.fg);
    c.muted = getCSSColor("--muted-foreground", c.muted);
    c.card = getCSSColor("--card", c.card);
    c.primary = getCSSColor("--primary", c.primary);
    c.accent = getCSSColor("--accent", c.accent);
    c.bg = getCSSColor("--background", c.bg);
  }, []);

  /* ─── Spawn gilli ─── */
  const spawnGilli = useCallback(() => {
    const s = stateRef.current;
    const yVariation = (Math.random() - 0.5) * 80;
    s.gilli = {
      x: GILLI_SPAWN_X,
      y: GROUND_Y - 60 + yVariation,
      speed: s.gilliSpeed + Math.random() * 1.5,
      angle: 0,
      rotation: 0,
      active: true,
    };
  }, []);

  /* ─── Spawn particles ─── */
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      s.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.8) * 6,
        life: 30 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }, []);

  /* ─── Handle swing ─── */
  const handleSwing = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "playing") return;
    if (s.batSwing > 0) return; // already swinging

    s.batSwing = 15; // swing animation frames

    // Check if gilli is in strike zone
    if (s.gilli && s.gilli.active) {
      const gilliCenterX = s.gilli.x;
      if (gilliCenterX >= STRIKE_ZONE_X - 20 && gilliCenterX <= STRIKE_ZONE_X + STRIKE_ZONE_W + 20) {
        // HIT!
        const precision = 1 - Math.abs(gilliCenterX - BAT_X) / (STRIKE_ZONE_W + 20);
        const points = Math.max(10, Math.round(precision * 100 * s.difficulty));
        const comboBonus = s.combo * 15;
        const totalPoints = points + comboBonus;

        s.score += totalPoints;
        s.combo += 1;

        // Launch gilli upward
        s.gilli.speed = -8 - precision * 6;
        s.gilli.angle = -0.8 - Math.random() * 0.4;
        s.gilli.active = false; // will fly off

        // Effects
        spawnParticles(s.gilli.x, s.gilli.y, colorsRef.current.strike, 15);
        s.flashTimer = 8;
        s.flashColor = colorsRef.current.strike;

        if (precision > 0.7) s.hitMessage = "PERFECT! 🔥";
        else if (precision > 0.4) s.hitMessage = "Great! 💪";
        else s.hitMessage = "Hit! 👍";
        s.hitMessageTimer = 45;

        setUiScore(s.score);
        trackEvent("successful_hit", { points: totalPoints, combo: s.combo, precision: Math.round(precision * 100) });
      }
    }
  }, [spawnParticles]);

  /* ─── Start game ─── */
  const startGame = useCallback(() => {
    trackEvent("game_start");
    const s = stateRef.current;
    s.phase = "playing";
    s.score = 0;
    s.combo = 0;
    s.lives = MAX_LIVES;
    s.gilli = null;
    s.spawnTimer = 30;
    s.spawnInterval = 90;
    s.gilliSpeed = 3.5;
    s.batSwing = 0;
    s.particles = [];
    s.flashTimer = 0;
    s.hitMessage = "";
    s.hitMessageTimer = 0;
    s.frameCount = 0;
    s.difficulty = 1;
    setUiPhase("playing");
    setUiScore(0);
  }, []);

  /* ─── Game loop ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const s = stateRef.current;
      const c = colorsRef.current;

      if (s.phase === "playing") {
        s.frameCount++;

        // Increase difficulty over time
        if (s.frameCount % 600 === 0) {
          s.difficulty += 0.2;
          s.gilliSpeed += 0.3;
          s.spawnInterval = Math.max(45, s.spawnInterval - 5);
        }

        // Spawn logic
        if (!s.gilli || !s.gilli.active) {
          s.spawnTimer--;
          if (s.spawnTimer <= 0) {
            spawnGilli();
            s.spawnTimer = s.spawnInterval;
          }
        }

        // Update gilli
        if (s.gilli) {
          if (s.gilli.active) {
            s.gilli.x -= s.gilli.speed;
            s.gilli.rotation += 0.08;

            // Missed — went past player
            if (s.gilli.x < BAT_X - 60) {
              s.lives--;
              s.combo = 0;
              s.flashTimer = 10;
              s.flashColor = c.miss;
              s.hitMessage = "Miss! ❌";
              s.hitMessageTimer = 40;
              spawnParticles(s.gilli.x, s.gilli.y, c.miss, 8);
              s.gilli = null;
              s.spawnTimer = 40;

              if (s.lives <= 0) {
                s.phase = "gameover";
                if (s.score > s.bestScore) {
                  s.bestScore = s.score;
                  localStorage.setItem("gilliPanda_best", String(s.score));
                  setUiBest(s.score);
                }
                setUiPhase("gameover");
                setUiScore(s.score);
                onGameOver?.(s.score);
              }
            }
          } else {
            // Flying away after hit
            s.gilli.x += s.gilli.speed * Math.cos(s.gilli.angle) * -2;
            s.gilli.y += s.gilli.speed * Math.sin(s.gilli.angle) * 2;
            s.gilli.rotation += 0.3;
            if (s.gilli.y < -50 || s.gilli.x > CANVAS_W + 100 || s.gilli.x < -100) {
              s.gilli = null;
              s.spawnTimer = 30;
            }
          }
        }

        // Bat swing cooldown
        if (s.batSwing > 0) s.batSwing--;

        // Particles
        s.particles = s.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life--;
          return p.life > 0;
        });

        // Flash timer
        if (s.flashTimer > 0) s.flashTimer--;
        if (s.hitMessageTimer > 0) s.hitMessageTimer--;
      }

      /* ─── DRAW ─── */
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, c.bg);
      skyGrad.addColorStop(1, c.sky);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 127 + 50) % CANVAS_W);
        const sy = ((i * 83 + 20) % (GROUND_Y - 40));
        const sz = 1 + (i % 3) * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
      groundGrad.addColorStop(0, c.ground);
      groundGrad.addColorStop(1, "#1a2e1a");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

      // Ground line
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      // Strike zone indicator (subtle)
      if (s.phase === "playing") {
        ctx.fillStyle = `rgba(255,255,255,0.04)`;
        ctx.fillRect(STRIKE_ZONE_X - 10, GROUND_Y - 140, STRIKE_ZONE_W + 20, 140);

        // Strike zone lines
        ctx.strokeStyle = `rgba(255,255,255,0.08)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(STRIKE_ZONE_X - 10, GROUND_Y - 140, STRIKE_ZONE_W + 20, 140);
        ctx.setLineDash([]);
      }

      // Bat (the danda)
      const batAngle = s.batSwing > 0 ? -0.8 * (s.batSwing / 15) : 0;
      ctx.save();
      ctx.translate(BAT_X, GROUND_Y - 10);
      ctx.rotate(batAngle);
      // Bat shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(-BAT_W / 2 + 2, -BAT_H + 2, BAT_W, BAT_H);
      // Bat body
      const batGrad = ctx.createLinearGradient(-BAT_W / 2, -BAT_H, BAT_W / 2, 0);
      batGrad.addColorStop(0, c.bat);
      batGrad.addColorStop(1, "#8B6914");
      ctx.fillStyle = batGrad;
      ctx.beginPath();
      ctx.roundRect(-BAT_W / 2, -BAT_H, BAT_W, BAT_H, 3);
      ctx.fill();
      // Bat grip
      ctx.fillStyle = "#5a3a0a";
      ctx.fillRect(-BAT_W / 2 - 1, -15, BAT_W + 2, 15);
      ctx.restore();

      // Player character (simple but charming)
      ctx.save();
      ctx.translate(BAT_X - 25, GROUND_Y);
      // Body
      ctx.fillStyle = c.primary;
      ctx.beginPath();
      ctx.roundRect(-15, -55, 30, 40, 8);
      ctx.fill();
      // Head
      ctx.fillStyle = c.fg;
      ctx.beginPath();
      ctx.arc(0, -68, 16, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = c.bg;
      ctx.beginPath();
      ctx.arc(-5, -71, 3, 0, Math.PI * 2);
      ctx.arc(5, -71, 3, 0, Math.PI * 2);
      ctx.fill();
      // Pupils (look at gilli)
      const lookDir = s.gilli && s.gilli.active ? Math.min(1, Math.max(-1, (s.gilli.x - BAT_X) / 200)) : 0.5;
      ctx.fillStyle = c.fg;
      ctx.beginPath();
      ctx.arc(-5 + lookDir * 1.5, -71, 1.5, 0, Math.PI * 2);
      ctx.arc(5 + lookDir * 1.5, -71, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.fillStyle = "#4a4a5a";
      ctx.fillRect(-12, -15, 10, 15);
      ctx.fillRect(2, -15, 10, 15);
      ctx.restore();

      // Gilli
      if (s.gilli) {
        ctx.save();
        ctx.translate(s.gilli.x, s.gilli.y);
        ctx.rotate(s.gilli.rotation);
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(-GILLI_W / 2 + 1, -GILLI_H / 2 + 1, GILLI_W, GILLI_H);
        // Body
        const gilliGrad = ctx.createLinearGradient(-GILLI_W / 2, -GILLI_H / 2, GILLI_W / 2, GILLI_H / 2);
        gilliGrad.addColorStop(0, c.gilli);
        gilliGrad.addColorStop(1, "#b8932e");
        ctx.fillStyle = gilliGrad;
        ctx.beginPath();
        ctx.roundRect(-GILLI_W / 2, -GILLI_H / 2, GILLI_W, GILLI_H, 2);
        ctx.fill();
        // Speed lines when active
        if (s.gilli.active && s.gilli.speed > 3) {
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 1;
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(GILLI_W / 2 + i * 8, -GILLI_H / 4);
            ctx.lineTo(GILLI_W / 2 + i * 8 + 12, -GILLI_H / 4);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Particles
      for (const p of s.particles) {
        ctx.globalAlpha = p.life / 50;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Screen flash
      if (s.flashTimer > 0) {
        ctx.fillStyle = s.flashColor;
        ctx.globalAlpha = s.flashTimer / 30;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.globalAlpha = 1;
      }

      // HUD during play
      if (s.phase === "playing") {
        // Score
        ctx.font = "bold 28px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.fg;
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${s.score}`, 20, 40);

        // Combo
        if (s.combo > 1) {
          ctx.font = "bold 18px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.score;
          ctx.fillText(`${s.combo}x Combo!`, 20, 65);
        }

        // Lives
        ctx.textAlign = "right";
        ctx.font = "24px sans-serif";
        for (let i = 0; i < MAX_LIVES; i++) {
          ctx.fillStyle = i < s.lives ? c.miss : "rgba(255,255,255,0.15)";
          ctx.fillText("❤️", CANVAS_W - 20 - i * 35, 40);
        }

        // Best score
        ctx.font = "14px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.muted;
        ctx.fillText(`Best: ${s.bestScore}`, CANVAS_W - 20, 65);

        // Hit message
        if (s.hitMessageTimer > 0) {
          ctx.textAlign = "center";
          ctx.font = "bold 32px 'Space Grotesk', sans-serif";
          ctx.globalAlpha = s.hitMessageTimer / 45;
          ctx.fillStyle = s.hitMessage.includes("Miss") ? c.miss : c.strike;
          ctx.fillText(s.hitMessage, CANVAS_W / 2, 180 - (45 - s.hitMessageTimer) * 0.5);
          ctx.globalAlpha = 1;
        }

        // Difficulty indicator
        if (s.difficulty > 1) {
          ctx.textAlign = "center";
          ctx.font = "12px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.muted;
          ctx.fillText(`Level ${Math.floor(s.difficulty)}`, CANVAS_W / 2, CANVAS_H - 15);
        }
      }

      // Ready screen
      if (s.phase === "ready") {
        // Dim overlay
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.textAlign = "center";
        ctx.font = "bold 48px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.fg;
        ctx.fillText("🏏 Gilli Panda", CANVAS_W / 2, 180);

        ctx.font = "18px 'Inter', sans-serif";
        ctx.fillStyle = c.muted;
        ctx.fillText("Time your swings to hit the gilli!", CANVAS_W / 2, 220);

        // Animated prompt
        const pulse = 0.7 + Math.sin(Date.now() / 400) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.font = "bold 22px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.accent;
        ctx.fillText("Click or Tap to Start", CANVAS_W / 2, 300);
        ctx.globalAlpha = 1;

        ctx.font = "14px 'Inter', sans-serif";
        ctx.fillStyle = c.muted;
        ctx.fillText("Click / Tap / Spacebar to swing", CANVAS_W / 2, 340);

        if (s.bestScore > 0) {
          ctx.font = "16px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.score;
          ctx.fillText(`🏆 Best: ${s.bestScore}`, CANVAS_W / 2, 380);
        }
      }

      // Game over screen
      if (s.phase === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.textAlign = "center";
        ctx.font = "bold 44px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.miss;
        ctx.fillText("Game Over", CANVAS_W / 2, 170);

        ctx.font = "bold 64px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.score;
        ctx.fillText(String(s.score), CANVAS_W / 2, 250);

        ctx.font = "18px 'Inter', sans-serif";
        ctx.fillStyle = c.muted;
        ctx.fillText("points", CANVAS_W / 2, 275);

        if (s.score >= s.bestScore && s.score > 0) {
          ctx.font = "bold 20px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.accent;
          ctx.fillText("🌟 New Record!", CANVAS_W / 2, 310);
        } else {
          ctx.font = "16px 'Inter', sans-serif";
          ctx.fillStyle = c.muted;
          ctx.fillText(`Best: ${s.bestScore}`, CANVAS_W / 2, 310);
        }

        const pulse2 = 0.7 + Math.sin(Date.now() / 400) * 0.3;
        ctx.globalAlpha = pulse2;
        ctx.font = "bold 22px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.accent;
        ctx.fillText("Click or Tap to Retry", CANVAS_W / 2, 370);
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnGilli, spawnParticles]);

  /* ─── Input handlers ─── */
  const handleInput = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "ready" || s.phase === "gameover") {
      startGame();
    } else if (s.phase === "playing") {
      handleSwing();
    }
  }, [startGame, handleSwing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleInput();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleInput]);

  /* ─── Responsive scaling ─── */
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const newScale = Math.min(1, containerW / CANVAS_W);
      setScale(newScale);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center bg-background" style={{ minHeight: "520px" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleInput}
        onTouchStart={(e) => { e.preventDefault(); handleInput(); }}
        className="cursor-pointer rounded-lg"
        style={{
          width: CANVAS_W * scale,
          height: CANVAS_H * scale,
          imageRendering: "auto",
        }}
      />
    </div>
  );
};

export default GilliDandaGame;
