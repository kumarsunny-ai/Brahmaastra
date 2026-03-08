import { useEffect, useRef, useCallback, useState } from "react";
import { trackEvent } from "@/lib/analytics";

/* ─── Types ─── */
type Phase = "ready" | "angle" | "power" | "flying" | "result" | "gameover";

interface FlyingGilli {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
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
const GROUND_Y = 400;
const PANDA_X = 160;
const GILLI_REST_X = PANDA_X + 30;
const GILLI_REST_Y = GROUND_Y - 5;
const MAX_ROUNDS = 5;
const GRAVITY = 0.35;

/* ─── CSS Color Resolver ─── */
function getCSSColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? `hsl(${val})` : fallback;
}

interface GilliDandaGameProps {
  onGameOver?: (score: number) => void;
  inputBlocked?: boolean;
}

/* ─── Draw Panda Helper ─── */
function drawPanda(ctx: CanvasRenderingContext2D, x: number, y: number, swingAngle: number, lookUp: boolean) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (white round)
  ctx.fillStyle = "#f0f0f0";
  ctx.beginPath();
  ctx.ellipse(0, -40, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = "#fafafa";
  ctx.beginPath();
  ctx.ellipse(0, -35, 18, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(-12, -8, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, -8, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms (left arm holds danda)
  ctx.fillStyle = "#1a1a1a";
  // Right arm
  ctx.beginPath();
  ctx.ellipse(24, -42, 8, 10, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Left arm + danda
  ctx.save();
  ctx.translate(-20, -50);
  ctx.rotate(swingAngle);
  // Arm
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(-4, 0, 8, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Danda (stick)
  const dandaGrad = ctx.createLinearGradient(0, -60, 0, 10);
  dandaGrad.addColorStop(0, "#c4903d");
  dandaGrad.addColorStop(0.5, "#b8860b");
  dandaGrad.addColorStop(1, "#8B6914");
  ctx.fillStyle = dandaGrad;
  ctx.beginPath();
  ctx.roundRect(-4, -65, 8, 75, 3);
  ctx.fill();
  ctx.restore();

  // Head
  ctx.fillStyle = "#f0f0f0";
  ctx.beginPath();
  ctx.arc(0, -76, 22, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(-18, -94, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, -94, 10, 0, Math.PI * 2);
  ctx.fill();
  // Inner ears
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-18, -94, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, -94, 5, 0, Math.PI * 2);
  ctx.fill();

  // Eye patches
  ctx.fillStyle = "#1a1a1a";
  ctx.save();
  ctx.translate(-8, -80);
  ctx.rotate(-0.2);
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(8, -80);
  ctx.rotate(0.2);
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eyes (white)
  const eyeY = lookUp ? -82 : -80;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-8, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();
  // Pupils
  const pupilY = lookUp ? -83 : -80;
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(-8, pupilY, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, pupilY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, -72, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (cute smile)
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-3, -68, 4, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(3, -68, 4, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Blush
  ctx.fillStyle = "rgba(255,150,150,0.3)";
  ctx.beginPath();
  ctx.ellipse(-16, -72, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, -72, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ─── Draw Gilli (small stick) ─── */
function drawGilli(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const grad = ctx.createLinearGradient(-3, -18, 3, 18);
  grad.addColorStop(0, "#d4a855");
  grad.addColorStop(1, "#b8932e");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-3, -18, 6, 36, 2);
  ctx.fill();
  // Tip marks
  ctx.fillStyle = "#c4903d";
  ctx.fillRect(-2, -16, 4, 3);
  ctx.fillRect(-2, 13, 4, 3);
  ctx.restore();
}

/* ─── Draw Meter ─── */
function drawMeter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  value: number, // 0-1
  label: string,
  colors: { bg: string; fill: string; perfect: string; text: string }
) {
  // Background
  ctx.fillStyle = colors.bg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  // Fill
  const fillW = w * value;
  ctx.fillStyle = colors.fill;
  ctx.beginPath();
  ctx.roundRect(x, y, fillW, h, 6);
  ctx.fill();
  // Perfect zone indicator (40-60%)
  ctx.fillStyle = colors.perfect;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.roundRect(x + w * 0.4, y, w * 0.2, h, 0);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.stroke();
  // Label
  ctx.font = "bold 14px 'Space Grotesk', sans-serif";
  ctx.fillStyle = colors.text;
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y - 8);
}

/* ─── Main Component ─── */
const GilliDandaGame = ({ onGameOver, inputBlocked }: GilliDandaGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const stateRef = useRef({
    phase: "ready" as Phase,
    totalScore: 0,
    round: 0,
    bestScore: parseInt(localStorage.getItem("gilliPanda_best") || "0"),

    // Angle phase
    angleMeter: 0, // 0-1, oscillates
    angleMeterDir: 1,
    angleMeterSpeed: 0.02,
    angleResult: 0, // 0-1 quality

    // Power phase
    powerMeter: 0,
    powerMeterDir: 1,
    powerMeterSpeed: 0.025,
    powerResult: 0,

    // Gilli launch from ground (phase 1 result)
    gilliLaunchY: 0,
    gilliLaunchVY: 0,
    gilliUpX: 0,
    gilliUpY: 0,
    gilliUpAngle: 0,

    // Flying phase (after power hit)
    flyingGilli: null as FlyingGilli | null,

    // Result phase
    resultDistance: 0,
    resultMessage: "",
    resultTimer: 0,

    // Panda animation
    pandaSwing: 0, // current swing angle for danda
    pandaSwingTarget: 0,

    // Visual
    particles: [] as Particle[],
    flashTimer: 0,
    flashColor: "",
    frameCount: 0,

    // Distance markers hit
    distanceMarker: 0,

    // Camera
    cameraX: 0,
  });

  const [uiPhase, setUiPhase] = useState<Phase>("ready");
  const [uiScore, setUiScore] = useState(0);
  const [uiRound, setUiRound] = useState(0);
  const [uiBest, setUiBest] = useState(stateRef.current.bestScore);

  /* ─── Colors ─── */
  const colorsRef = useRef({
    sky1: "#87CEEB",
    sky2: "#4a90d9",
    ground1: "#5a8f3c",
    ground2: "#3d6b28",
    dirt: "#8B7355",
    fg: "#fafafa",
    muted: "#6b7280",
    primary: "#8b5cf6",
    accent: "#10b981",
    score: "#fbbf24",
    miss: "#ef4444",
    bg: "#0a0a0f",
  });

  useEffect(() => {
    const c = colorsRef.current;
    c.fg = getCSSColor("--foreground", c.fg);
    c.muted = getCSSColor("--muted-foreground", c.muted);
    c.primary = getCSSColor("--primary", c.primary);
    c.accent = getCSSColor("--accent", c.accent);
    c.bg = getCSSColor("--background", c.bg);
  }, []);

  /* ─── Spawn particles ─── */
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      s.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 8 - 2,
        life: 25 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }, []);

  /* ─── Calculate score from angle + power ─── */
  const calcScore = (angleQ: number, powerQ: number): { distance: number; points: number; message: string } => {
    // Angle quality: how close to center (0.5) of meter
    const anglePrecision = 1 - Math.abs(angleQ - 0.5) * 2; // 0 at edges, 1 at center
    // Power quality: how close to center (0.5)
    const powerPrecision = 1 - Math.abs(powerQ - 0.5) * 2;

    const combined = anglePrecision * 0.5 + powerPrecision * 0.5;
    const distance = Math.round(combined * 100 + Math.random() * 10);
    const points = Math.round(distance * (1 + combined * 0.5));

    let message = "";
    if (combined > 0.85) message = "PERFECT HIT! 🔥";
    else if (combined > 0.6) message = "Great Shot! 💪";
    else if (combined > 0.35) message = "Good! 👍";
    else if (combined > 0.15) message = "Okay... 😅";
    else message = "Weak hit 😬";

    return { distance, points, message };
  };

  /* ─── Start new round ─── */
  const startRound = useCallback(() => {
    const s = stateRef.current;
    s.phase = "angle";
    s.angleMeter = 0;
    s.angleMeterDir = 1;
    s.angleMeterSpeed = 0.02 + s.round * 0.003; // gets faster each round
    s.powerMeter = 0;
    s.powerMeterDir = 1;
    s.powerMeterSpeed = 0.025 + s.round * 0.004;
    s.angleResult = 0;
    s.powerResult = 0;
    s.flyingGilli = null;
    s.pandaSwing = -0.3;
    s.pandaSwingTarget = -0.3;
    s.gilliUpX = GILLI_REST_X;
    s.gilliUpY = GILLI_REST_Y;
    s.gilliUpAngle = -0.4; // resting angle on ground
    s.cameraX = 0;
    s.distanceMarker = 0;
    setUiPhase("angle");
  }, []);

  /* ─── Start game ─── */
  const startGame = useCallback(() => {
    trackEvent("game_start");
    const s = stateRef.current;
    s.totalScore = 0;
    s.round = 0;
    s.particles = [];
    s.flashTimer = 0;
    s.frameCount = 0;
    s.resultTimer = 0;
    setUiScore(0);
    setUiRound(0);
    startRound();
  }, [startRound]);

  /* ─── Handle input ─── */
  const handleInput = useCallback(() => {
    if (inputBlocked) return;
    const s = stateRef.current;

    if (s.phase === "ready" || s.phase === "gameover") {
      startGame();
      return;
    }

    if (s.phase === "angle") {
      // Lock angle
      s.angleResult = s.angleMeter;
      const anglePrecision = 1 - Math.abs(s.angleMeter - 0.5) * 2;

      // Animate gilli flipping up
      s.gilliLaunchVY = -8 - anglePrecision * 6; // how high it goes
      s.phase = "power";
      s.pandaSwingTarget = 0.5; // swing forward to flip gilli
      spawnParticles(GILLI_REST_X, GILLI_REST_Y, "#d4a855", 8);
      setUiPhase("power");
      trackEvent("angle_locked", { quality: Math.round(anglePrecision * 100) });
      return;
    }

    if (s.phase === "power") {
      // Lock power and launch
      s.powerResult = s.powerMeter;
      const anglePrecision = 1 - Math.abs(s.angleResult - 0.5) * 2;
      const powerPrecision = 1 - Math.abs(s.powerMeter - 0.5) * 2;

      // Create flying gilli
      const speed = 5 + powerPrecision * 12;
      const launchAngle = -0.3 - anglePrecision * 0.4; // better angle = more upward
      s.flyingGilli = {
        x: s.gilliUpX,
        y: s.gilliUpY,
        vx: speed * Math.cos(launchAngle),
        vy: speed * Math.sin(launchAngle),
        rotation: 0,
        rotSpeed: 0.15 + powerPrecision * 0.2,
      };

      s.pandaSwingTarget = -1.2; // big swing
      s.phase = "flying";
      spawnParticles(s.gilliUpX, s.gilliUpY, colorsRef.current.accent, 15);
      s.flashTimer = 6;
      s.flashColor = colorsRef.current.accent;
      setUiPhase("flying");
      trackEvent("power_locked", { quality: Math.round(powerPrecision * 100) });
      return;
    }

    if (s.phase === "result") {
      // Next round or game over
      s.round++;
      setUiRound(s.round);
      if (s.round >= MAX_ROUNDS) {
        s.phase = "gameover";
        if (s.totalScore > s.bestScore) {
          s.bestScore = s.totalScore;
          localStorage.setItem("gilliPanda_best", String(s.totalScore));
          setUiBest(s.totalScore);
        }
        setUiPhase("gameover");
        trackEvent("game_over", { score: s.totalScore, newRecord: s.totalScore >= s.bestScore });
        onGameOver?.(s.totalScore);
      } else {
        startRound();
      }
      return;
    }
  }, [startGame, startRound, spawnParticles, inputBlocked, onGameOver]);

  /* ─── Game loop ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const s = stateRef.current;
      const c = colorsRef.current;
      s.frameCount++;

      /* ─── UPDATE ─── */
      // Angle meter oscillation
      if (s.phase === "angle") {
        s.angleMeter += s.angleMeterSpeed * s.angleMeterDir;
        if (s.angleMeter >= 1) { s.angleMeter = 1; s.angleMeterDir = -1; }
        if (s.angleMeter <= 0) { s.angleMeter = 0; s.angleMeterDir = 1; }
      }

      // Power phase: meter oscillation + gilli rising
      if (s.phase === "power") {
        s.powerMeter += s.powerMeterSpeed * s.powerMeterDir;
        if (s.powerMeter >= 1) { s.powerMeter = 1; s.powerMeterDir = -1; }
        if (s.powerMeter <= 0) { s.powerMeter = 0; s.powerMeterDir = 1; }

        // Gilli rising animation
        s.gilliLaunchVY += GRAVITY * 0.5;
        s.gilliUpY += s.gilliLaunchVY;
        s.gilliUpAngle += 0.08;

        // Gilli hovers at peak
        if (s.gilliLaunchVY > 0 && s.gilliUpY > GROUND_Y - 120) {
          s.gilliUpY = GROUND_Y - 120;
          s.gilliLaunchVY = 0;
        }
      }

      // Flying gilli
      if (s.phase === "flying" && s.flyingGilli) {
        const fg = s.flyingGilli;
        fg.vy += GRAVITY;
        fg.x += fg.vx;
        fg.y += fg.vy;
        fg.rotation += fg.rotSpeed;

        // Camera follows gilli
        if (fg.x > CANVAS_W * 0.4) {
          s.cameraX = fg.x - CANVAS_W * 0.4;
        }

        // Track distance
        s.distanceMarker = Math.max(s.distanceMarker, Math.round((fg.x - GILLI_REST_X) / 5));

        // Gilli landed
        if (fg.y >= GROUND_Y) {
          fg.y = GROUND_Y;
          const { distance, points, message } = calcScore(s.angleResult, s.powerResult);
          s.resultDistance = distance;
          s.resultMessage = message;
          s.totalScore += points;
          s.resultTimer = 120;
          s.phase = "result";
          setUiScore(s.totalScore);
          setUiPhase("result");

          // Landing particles
          spawnParticles(fg.x - s.cameraX, GROUND_Y, "#8B7355", 12);
          s.flashTimer = 5;
          s.flashColor = points > 60 ? c.accent : c.score;

          trackEvent("round_complete", { round: s.round + 1, distance, points });
        }
      }

      // Panda swing animation (smooth lerp)
      s.pandaSwing += (s.pandaSwingTarget - s.pandaSwing) * 0.15;

      // Particles update
      s.particles = s.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        return p.life > 0;
      });

      if (s.flashTimer > 0) s.flashTimer--;
      if (s.resultTimer > 0) s.resultTimer--;

      /* ─── DRAW ─── */
      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, c.sky1);
      skyGrad.addColorStop(1, c.sky2);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Clouds (parallax)
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      const cloudOffset = -s.cameraX * 0.1;
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 200 + 80 + cloudOffset) % (CANVAS_W + 200)) - 100;
        const cy = 50 + (i * 37) % 80;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.arc(cx + 20, cy - 8, 20, 0, Math.PI * 2);
        ctx.arc(cx + 40, cy, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun
      ctx.fillStyle = "#FFD700";
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(CANVAS_W - 80, 60, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(CANVAS_W - 80, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Ground
      const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
      groundGrad.addColorStop(0, c.ground1);
      groundGrad.addColorStop(1, c.ground2);
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

      // Dirt strip
      ctx.fillStyle = c.dirt;
      ctx.fillRect(0, GROUND_Y, CANVAS_W, 4);

      // Distance markers on ground
      if (s.phase === "flying" || s.phase === "result") {
        ctx.font = "11px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        for (let d = 50; d <= 500; d += 50) {
          const markerX = GILLI_REST_X + d * 5 - s.cameraX;
          if (markerX > 0 && markerX < CANVAS_W) {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(markerX, GROUND_Y - 10, 2, 20);
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillText(`${d}m`, markerX, GROUND_Y + 30);
          }
        }
      }

      // Grass tufts
      ctx.fillStyle = "#6aad45";
      for (let i = 0; i < 20; i++) {
        const gx = ((i * 47 + 15 - s.cameraX * 0.5) % CANVAS_W);
        ctx.beginPath();
        ctx.moveTo(gx, GROUND_Y);
        ctx.lineTo(gx - 3, GROUND_Y - 8 - (i % 3) * 3);
        ctx.lineTo(gx + 3, GROUND_Y - 6 - (i % 4) * 2);
        ctx.closePath();
        ctx.fill();
      }

      // Panda
      const pandaDrawX = s.phase === "flying" || s.phase === "result" ? PANDA_X - s.cameraX : PANDA_X;
      if (pandaDrawX > -60 && pandaDrawX < CANVAS_W + 60) {
        drawPanda(ctx, pandaDrawX, GROUND_Y, s.pandaSwing, s.phase === "power" || s.phase === "flying");
      }

      // Gilli on ground (angle phase)
      if (s.phase === "angle" || s.phase === "ready") {
        const restAngle = -0.4 + (s.phase === "angle" ? Math.sin(s.frameCount * 0.05) * 0.1 : 0);
        drawGilli(ctx, GILLI_REST_X, GILLI_REST_Y, restAngle);
      }

      // Gilli rising (power phase)
      if (s.phase === "power") {
        drawGilli(ctx, s.gilliUpX, s.gilliUpY, s.gilliUpAngle);
      }

      // Flying gilli
      if (s.phase === "flying" && s.flyingGilli) {
        const fg = s.flyingGilli;
        drawGilli(ctx, fg.x - s.cameraX, fg.y, fg.rotation);
        // Trail
        ctx.fillStyle = "rgba(212,168,85,0.3)";
        for (let t = 1; t <= 3; t++) {
          ctx.beginPath();
          ctx.arc(fg.x - s.cameraX - fg.vx * t * 2, fg.y - fg.vy * t * 0.5, 3 - t * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Landed gilli
      if (s.phase === "result" && s.flyingGilli) {
        drawGilli(ctx, s.flyingGilli.x - s.cameraX, GROUND_Y - 2, -0.2);
        // Landing flag
        const flagX = s.flyingGilli.x - s.cameraX;
        if (flagX > 0 && flagX < CANVAS_W) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(flagX, GROUND_Y);
          ctx.lineTo(flagX, GROUND_Y - 40);
          ctx.stroke();
          ctx.fillStyle = c.accent;
          ctx.beginPath();
          ctx.moveTo(flagX, GROUND_Y - 40);
          ctx.lineTo(flagX + 18, GROUND_Y - 34);
          ctx.lineTo(flagX, GROUND_Y - 28);
          ctx.fill();
        }
      }

      // Particles
      for (const p of s.particles) {
        ctx.globalAlpha = p.life / 45;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Screen flash
      if (s.flashTimer > 0) {
        ctx.fillStyle = s.flashColor;
        ctx.globalAlpha = s.flashTimer / 20;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.globalAlpha = 1;
      }

      /* ─── HUD ─── */
      if (s.phase !== "ready" && s.phase !== "gameover") {
        // Score + Round
        ctx.font = "bold 24px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(`Score: ${s.totalScore}`, 20, 36);
        ctx.font = "14px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(`Round ${s.round + 1} / ${MAX_ROUNDS}`, 20, 56);
        ctx.shadowBlur = 0;

        // Best
        ctx.textAlign = "right";
        ctx.font = "14px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(`Best: ${s.bestScore}`, CANVAS_W - 16, 36);
      }

      // Angle meter
      if (s.phase === "angle") {
        drawMeter(ctx, CANVAS_W / 2 - 120, CANVAS_H - 80, 240, 24, s.angleMeter,
          "⬆ TAP to set angle", {
            bg: "rgba(0,0,0,0.4)",
            fill: "#f59e0b",
            perfect: "#22c55e",
            text: "#fff",
          });
        // Instruction
        ctx.font = "13px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.textAlign = "center";
        ctx.fillText("Hit the gilli at the right angle to flip it up!", CANVAS_W / 2, CANVAS_H - 42);
      }

      // Power meter
      if (s.phase === "power") {
        drawMeter(ctx, CANVAS_W / 2 - 120, CANVAS_H - 80, 240, 24, s.powerMeter,
          "💥 TAP for power!", {
            bg: "rgba(0,0,0,0.4)",
            fill: "#ef4444",
            perfect: "#22c55e",
            text: "#fff",
          });
        ctx.font = "13px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.textAlign = "center";
        ctx.fillText("Swing at the right power to send it flying!", CANVAS_W / 2, CANVAS_H - 42);
      }

      // Flying distance display
      if (s.phase === "flying") {
        ctx.font = "bold 28px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(`${s.distanceMarker}m`, CANVAS_W / 2, 90);
        ctx.shadowBlur = 0;
      }

      // Result overlay
      if (s.phase === "result") {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 6;

        ctx.font = "bold 36px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(s.resultMessage, CANVAS_W / 2, 180);

        ctx.font = "bold 60px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.score;
        ctx.fillText(`${s.resultDistance}m`, CANVAS_W / 2, 250);

        const pulse = 0.6 + Math.sin(Date.now() / 300) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.font = "bold 20px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        const nextText = s.round + 1 >= MAX_ROUNDS ? "▶  See Final Score" : "▶  Next Round";
        ctx.fillText(nextText, CANVAS_W / 2, 320);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // Ready screen
      if (s.phase === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.textAlign = "center";

        ctx.font = "12px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillText("brahmaastra.com", CANVAS_W / 2, 120);

        ctx.font = "bold 48px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText("🐼 Gilli Panda", CANVAS_W / 2, 175);

        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText("Flip the gilli up, then smash it as far as you can!", CANVAS_W / 2, 215);

        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillText("Click · Tap · Spacebar", CANVAS_W / 2, 250);

        const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.font = "bold 24px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.accent;
        ctx.fillText("▶  Start Game", CANVAS_W / 2, 310);
        ctx.globalAlpha = 1;

        if (s.bestScore > 0) {
          ctx.font = "16px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.score;
          ctx.fillText(`🏆 Best: ${s.bestScore}`, CANVAS_W / 2, 360);
        }
      }

      // Game over screen
      if (s.phase === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.textAlign = "center";

        ctx.font = "bold 40px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.miss;
        ctx.fillText("Game Over!", CANVAS_W / 2, 145);

        ctx.font = "bold 72px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.score;
        ctx.fillText(String(s.totalScore), CANVAS_W / 2, 230);

        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("total points", CANVAS_W / 2, 258);

        if (s.totalScore >= s.bestScore && s.totalScore > 0) {
          ctx.font = "bold 22px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.accent;
          ctx.fillText("🌟 New Record!", CANVAS_W / 2, 298);
        } else {
          ctx.font = "14px 'Inter', sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillText(`Best: ${s.bestScore}`, CANVAS_W / 2, 298);
        }

        const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.font = "bold 22px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.accent;
        ctx.fillText("▶  Play Again", CANVAS_W / 2, 360);
        ctx.globalAlpha = 1;

        ctx.font = "11px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillText("brahmaastra.com", CANVAS_W / 2, 410);
      }

      // Branding watermark during play
      if (s.phase !== "ready" && s.phase !== "gameover") {
        ctx.textAlign = "right";
        ctx.font = "10px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillText("brahmaastra.com", CANVAS_W - 12, CANVAS_H - 10);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnParticles]);

  /* ─── Input handlers ─── */
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
