import { useEffect, useRef, useCallback, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { sfxHit, sfxMiss, sfxPerfect, sfxGameOver, sfxStart, sfxWhoosh } from "@/lib/sounds";

/* ─── Types ─── */
type Phase = "ready" | "angle" | "gilliUp" | "power" | "flying" | "result" | "gameover";
type PandaMood = "idle" | "focus" | "swing" | "happy" | "perfect" | "frustrated" | "hungry";

interface FlyingGilli {
  x: number; y: number; vx: number; vy: number;
  rotation: number; rotSpeed: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number;
}

interface Obstacle {
  x: number; type: "bamboo" | "dumpling" | "apple";
  hit: boolean;
}

/* ─── Constants ─── */
const W = 800, H = 520;
const GY = 400; // ground Y
const PX = 160; // panda X
const GILLI_X = PX + 38;
const GILLI_Y = GY - 4;
const ROUNDS = 5;
const GRAV = 0.32;

/* ─── Helpers ─── */
function hsl(varName: string, fb: string): string {
  if (typeof document === "undefined") return fb;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `hsl(${v})` : fb;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

interface Props {
  onGameOver?: (score: number) => void;
  inputBlocked?: boolean;
}

/* ═══════════════════════════════════════════════
   Draw Panda — cartoonish 3D with mood reactions
   ═══════════════════════════════════════════════ */
function drawPanda(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  swing: number, mood: PandaMood, frame: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Idle bounce
  const breathe = mood === "idle" ? Math.sin(frame * 0.04) * 3 : 0;
  const squash = mood === "happy" || mood === "perfect"
    ? 1 + Math.sin(frame * 0.15) * 0.06 : 1;
  const shake = mood === "frustrated" || mood === "hungry"
    ? Math.sin(frame * 0.5) * 3 : 0;

  ctx.translate(shake, breathe);

  // Shadow (3D feel)
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 30, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Body ──
  ctx.save();
  ctx.scale(1, squash);
  // Body outline glow (3D rim)
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, -40, 29, 33, 0, 0, Math.PI * 2);
  ctx.fill();
  // Main body
  const bodyGrad = ctx.createRadialGradient(-5, -48, 5, 0, -38, 30);
  bodyGrad.addColorStop(0, "#ffffff");
  bodyGrad.addColorStop(0.7, "#e8e8e8");
  bodyGrad.addColorStop(1, "#d0d0d0");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -40, 27, 31, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly highlight
  const bellyGrad = ctx.createRadialGradient(0, -36, 3, 0, -35, 20);
  bellyGrad.addColorStop(0, "#fffdf5");
  bellyGrad.addColorStop(1, "rgba(255,253,245,0)");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -35, 18, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Legs ──
  for (const side of [-1, 1]) {
    const legGrad = ctx.createRadialGradient(side * 12, -8, 2, side * 12, -8, 10);
    legGrad.addColorStop(0, "#2a2a2a");
    legGrad.addColorStop(1, "#111");
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.ellipse(side * 13, -7, 11, 9, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Paw pad
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.ellipse(side * 15, -3, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Right arm ──
  const rArmGrad = ctx.createRadialGradient(24, -44, 2, 24, -42, 10);
  rArmGrad.addColorStop(0, "#2a2a2a");
  rArmGrad.addColorStop(1, "#111");
  ctx.fillStyle = rArmGrad;
  ctx.beginPath();
  ctx.ellipse(25, -43, 9, 11, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Left arm + danda ──
  ctx.save();
  ctx.translate(-22, -52);
  ctx.rotate(swing);
  // Arm
  const lArmGrad = ctx.createRadialGradient(-4, 0, 2, -4, 0, 10);
  lArmGrad.addColorStop(0, "#2a2a2a");
  lArmGrad.addColorStop(1, "#111");
  ctx.fillStyle = lArmGrad;
  ctx.beginPath();
  ctx.ellipse(-4, 0, 9, 11, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Danda (wooden stick with 3D shading)
  const dandaG = ctx.createLinearGradient(-5, -68, 6, -68);
  dandaG.addColorStop(0, "#a07030");
  dandaG.addColorStop(0.3, "#d4a855");
  dandaG.addColorStop(0.7, "#c4903d");
  dandaG.addColorStop(1, "#8B6914");
  ctx.fillStyle = dandaG;
  ctx.beginPath();
  ctx.roundRect(-5, -70, 10, 80, 4);
  ctx.fill();
  // Wood grain
  ctx.strokeStyle = "rgba(139,105,20,0.3)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-3, -60 + i * 12);
    ctx.lineTo(3, -58 + i * 12);
    ctx.stroke();
  }
  ctx.restore();

  // ── Head ──
  const headGrad = ctx.createRadialGradient(-4, -82, 6, 0, -76, 24);
  headGrad.addColorStop(0, "#ffffff");
  headGrad.addColorStop(0.8, "#ececec");
  headGrad.addColorStop(1, "#d5d5d5");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -78, 24, 0, Math.PI * 2);
  ctx.fill();

  // ── Ears ──
  for (const side of [-1, 1]) {
    const earGrad = ctx.createRadialGradient(side * 19, -98, 2, side * 19, -97, 11);
    earGrad.addColorStop(0, "#333");
    earGrad.addColorStop(1, "#111");
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.arc(side * 19, -97, 11, 0, Math.PI * 2);
    ctx.fill();
    // Inner ear pink
    ctx.fillStyle = "#554";
    ctx.beginPath();
    ctx.arc(side * 19, -97, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Eye patches ──
  for (const side of [-1, 1]) {
    const patchGrad = ctx.createRadialGradient(side * 9, -82, 2, side * 9, -82, 10);
    patchGrad.addColorStop(0, "#222");
    patchGrad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = patchGrad;
    ctx.save();
    ctx.translate(side * 9, -82);
    ctx.rotate(side * -0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Eyes ──
  const eyeExpr = mood === "frustrated" || mood === "hungry";
  const lookUp = mood === "focus" || mood === "swing";
  for (const side of [-1, 1]) {
    const ey = lookUp ? -84 : -82;
    // White
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(side * 9, ey, eyeExpr ? 3.5 : 5, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    const py = lookUp ? -85 : -82;
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(side * 9, py, eyeExpr ? 2 : 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Sparkle
    if (!eyeExpr) {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(side * 9 + 1.5, py - 1.5, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Frustrated squint lines ──
  if (eyeExpr) {
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 4, -86);
      ctx.lineTo(side * 14, -87);
      ctx.stroke();
    }
  }

  // ── Nose ──
  const noseGrad = ctx.createRadialGradient(0, -73, 1, 0, -73, 4);
  noseGrad.addColorStop(0, "#333");
  noseGrad.addColorStop(1, "#111");
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(0, -73, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.ellipse(-1, -74, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Mouth ──
  if (mood === "happy" || mood === "perfect") {
    // Big smile
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -68, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // Tongue for perfect
    if (mood === "perfect") {
      ctx.fillStyle = "#e76";
      ctx.beginPath();
      ctx.ellipse(0, -63, 4, 3, 0, 0, Math.PI);
      ctx.fill();
    }
  } else if (mood === "frustrated") {
    // Wavy unhappy mouth
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -66);
    ctx.quadraticCurveTo(-3, -62, 0, -66);
    ctx.quadraticCurveTo(3, -70, 6, -66);
    ctx.stroke();
  } else if (mood === "hungry") {
    // Open mouth drool
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.ellipse(0, -66, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e76";
    ctx.beginPath();
    ctx.ellipse(0, -64, 4, 2, 0, 0, Math.PI);
    ctx.fill();
    // Drool drop
    ctx.fillStyle = "rgba(150,200,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(4, -60 + Math.sin(frame * 0.1) * 2, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Normal cute smile
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-3, -69, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(3, -69, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  // ── Blush ──
  const blushAlpha = mood === "happy" || mood === "perfect" ? 0.45 : 0.25;
  ctx.fillStyle = `rgba(255,140,140,${blushAlpha})`;
  ctx.beginPath();
  ctx.ellipse(-17, -73, 6, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(17, -73, 6, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Mood effects ──
  if (mood === "perfect") {
    // Stars around head
    ctx.fillStyle = "#fbbf24";
    for (let i = 0; i < 3; i++) {
      const a = frame * 0.03 + (i * Math.PI * 2) / 3;
      const sx = Math.cos(a) * 32;
      const sy = -90 + Math.sin(a * 1.5) * 8;
      ctx.font = "12px sans-serif";
      ctx.fillText("⭐", sx - 6, sy);
    }
  }
  if (mood === "frustrated") {
    // Anger mark
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    const ax = 18, ay = -100;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax + 6, ay);
    ctx.moveTo(ax + 3, ay - 3); ctx.lineTo(ax + 3, ay + 3);
    ctx.stroke();
  }
  if (mood === "hungry") {
    // Thought bubble with food
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(30, -110, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22, -95, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(18, -88, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "14px sans-serif";
    ctx.fillText("🍜", 22, -105);
  }

  ctx.restore();
}

/* ─── Draw Gilli ─── */
function drawGilli(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const g = ctx.createLinearGradient(-4, -20, 5, 20);
  g.addColorStop(0, "#e0b860");
  g.addColorStop(0.3, "#d4a855");
  g.addColorStop(0.7, "#c4903d");
  g.addColorStop(1, "#a07030");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-4, -20, 8, 40, 3);
  ctx.fill();
  // Highlight edge (3D)
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.roundRect(-4, -20, 3, 40, 3);
  ctx.fill();
  // Tips
  ctx.fillStyle = "#b8860b";
  ctx.fillRect(-3, -18, 6, 4);
  ctx.fillRect(-3, 14, 6, 4);
  ctx.restore();
}

/* ─── Draw Meter ─── */
function drawMeter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  value: number, label: string,
  colors: { bg: string; fill: string; perfect: string; text: string }
) {
  // Background with rounded corners
  ctx.fillStyle = colors.bg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  // Perfect zone (35-65%)
  ctx.fillStyle = colors.perfect;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.roundRect(x + w * 0.35, y, w * 0.3, h, 0);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Fill bar
  const fw = w * value;
  const fillGrad = ctx.createLinearGradient(x, y, x + fw, y);
  fillGrad.addColorStop(0, colors.fill);
  fillGrad.addColorStop(1, colors.fill + "cc");
  ctx.fillStyle = fillGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, fw, h, 8);
  ctx.fill();
  // Indicator line
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + fw - 2, y - 2, 4, h + 4);
  // Border glow
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.stroke();
  // Label
  ctx.font = "bold 14px 'Space Grotesk', sans-serif";
  ctx.fillStyle = colors.text;
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 3;
  ctx.fillText(label, x + w / 2, y - 10);
  ctx.shadowBlur = 0;
}

/* ─── Draw Food Obstacle ─── */
function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, camX: number) {
  const sx = obs.x - camX;
  if (sx < -40 || sx > W + 40) return;
  const emoji = obs.type === "bamboo" ? "🎋" : obs.type === "dumpling" ? "🥟" : "🍎";
  ctx.font = obs.hit ? "20px sans-serif" : "26px sans-serif";
  ctx.globalAlpha = obs.hit ? 0.35 : 1;
  ctx.textAlign = "center";
  ctx.fillText(emoji, sx, GY - 10);
  ctx.globalAlpha = 1;
}

/* ═══════════ MAIN COMPONENT ═══════════ */
const GilliDandaGame = ({ onGameOver, inputBlocked }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const s = useRef({
    phase: "ready" as Phase,
    mood: "idle" as PandaMood,
    moodTimer: 0,
    totalScore: 0,
    round: 0,
    bestScore: parseInt(localStorage.getItem("gilliPanda_best") || "0"),

    // Angle meter (SLOW)
    angleMeter: 0,
    angleMeterDir: 1,
    angleMeterSpeed: 0.008, // much slower
    angleResult: 0,

    // Gilli up animation
    gilliUpY: GILLI_Y,
    gilliUpVY: 0,
    gilliUpAngle: -0.4,
    gilliAtPeak: false,

    // Power meter (SLOW)
    powerMeter: 0,
    powerMeterDir: 1,
    powerMeterSpeed: 0.01,
    powerResult: 0,

    // Flying
    fg: null as FlyingGilli | null,
    distMark: 0,
    camX: 0,

    // Result
    resDist: 0,
    resMsg: "",
    resTimer: 0,
    hitObstacle: null as Obstacle | null,

    // Panda swing
    swing: -0.3,
    swingTarget: -0.3,

    // Obstacles
    obstacles: [] as Obstacle[],

    // Particles
    particles: [] as Particle[],
    flashTimer: 0,
    flashColor: "",
    frame: 0,
  });

  const [uiPhase, setUiPhase] = useState<Phase>("ready");
  const [uiScore, setUiScore] = useState(0);
  const [uiRound, setUiRound] = useState(0);
  const [uiBest, setUiBest] = useState(s.current.bestScore);

  const colRef = useRef({
    sky1: "#87CEEB", sky2: "#4a90d9",
    ground1: "#5a8f3c", ground2: "#3d6b28", dirt: "#8B7355",
    fg: "#fafafa", muted: "#6b7280",
    primary: "#8b5cf6", accent: "#10b981",
    score: "#fbbf24", miss: "#ef4444",
  });

  useEffect(() => {
    const c = colRef.current;
    c.fg = hsl("--foreground", c.fg);
    c.muted = hsl("--muted-foreground", c.muted);
    c.primary = hsl("--primary", c.primary);
    c.accent = hsl("--accent", c.accent);
  }, []);

  /* ─── Spawn particles ─── */
  const burst = useCallback((x: number, y: number, col: string, n: number) => {
    for (let i = 0; i < n; i++) {
      s.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 8 - 2,
        life: 25 + Math.random() * 20,
        color: col, size: 2 + Math.random() * 4,
      });
    }
  }, []);

  /* ─── Generate obstacles for round ─── */
  const generateObstacles = useCallback(() => {
    const obs: Obstacle[] = [];
    const types: Obstacle["type"][] = ["bamboo", "dumpling", "apple"];
    // Place 3-5 obstacles at random distances
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      obs.push({
        x: GILLI_X + 200 + Math.random() * 1800,
        type: types[Math.floor(Math.random() * types.length)],
        hit: false,
      });
    }
    return obs.sort((a, b) => a.x - b.x);
  }, []);

  /* ─── Calculate score ─── */
  const calcScore = (aQ: number, pQ: number, hitFood: boolean): {
    distance: number; points: number; message: string;
  } => {
    const aPrec = 1 - Math.abs(aQ - 0.5) * 2;
    const pPrec = 1 - Math.abs(pQ - 0.5) * 2;
    const combined = aPrec * 0.6 + pPrec * 0.4; // angle matters more
    let distance = Math.round(combined * 110 + Math.random() * 8);
    let points = Math.round(distance * (1 + combined * 0.5));

    if (hitFood) {
      points = Math.round(points * 0.5); // penalty
      distance = Math.round(distance * 0.7);
    }

    let message = "";
    if (hitFood) message = "Hit the food! 🍜😫";
    else if (combined > 0.85) message = "PERFECT HIT! 🔥";
    else if (combined > 0.6) message = "Great Shot! 💪";
    else if (combined > 0.35) message = "Good! 👍";
    else if (combined > 0.15) message = "Okay... 😅";
    else message = "Weak hit 😬";

    return { distance, points, message };
  };

  /* ─── Start round ─── */
  const startRound = useCallback(() => {
    const st = s.current;
    st.phase = "angle";
    st.mood = "focus";
    st.angleMeter = 0;
    st.angleMeterDir = 1;
    st.angleMeterSpeed = 0.008 + st.round * 0.001; // slow, gets slightly faster
    st.powerMeter = 0;
    st.powerMeterDir = 1;
    st.powerMeterSpeed = 0.01 + st.round * 0.0015;
    st.angleResult = 0;
    st.powerResult = 0;
    st.fg = null;
    st.swing = -0.3;
    st.swingTarget = -0.3;
    st.gilliUpY = GILLI_Y;
    st.gilliUpVY = 0;
    st.gilliUpAngle = -0.4;
    st.gilliAtPeak = false;
    st.camX = 0;
    st.distMark = 0;
    st.hitObstacle = null;
    st.obstacles = generateObstacles();
    setUiPhase("angle");
  }, [generateObstacles]);

  /* ─── Start game ─── */
  const startGame = useCallback(() => {
    trackEvent("game_start");
    const st = s.current;
    st.totalScore = 0;
    st.round = 0;
    st.particles = [];
    st.flashTimer = 0;
    st.frame = 0;
    st.resTimer = 0;
    setUiScore(0);
    setUiRound(0);
    startRound();
  }, [startRound]);

  /* ─── Handle tap/click ─── */
  const handleInput = useCallback(() => {
    if (inputBlocked) return;
    const st = s.current;

    if (st.phase === "ready" || st.phase === "gameover") {
      startGame();
      sfxStart();
      return;
    }

    if (st.phase === "angle") {
      // Lock angle → gilli flips up
      st.angleResult = st.angleMeter;
      const aPrec = 1 - Math.abs(st.angleMeter - 0.5) * 2;
      st.gilliUpVY = -7 - aPrec * 5;
      st.phase = "gilliUp";
      st.mood = "swing";
      st.swingTarget = 0.6;
      burst(GILLI_X, GILLI_Y, "#d4a855", 10);
      setUiPhase("gilliUp");
      trackEvent("angle_locked", { quality: Math.round(aPrec * 100) });
      return;
    }

    if (st.phase === "power") {
      // Lock power → launch gilli
      st.powerResult = st.powerMeter;
      const aPrec = 1 - Math.abs(st.angleResult - 0.5) * 2;
      const pPrec = 1 - Math.abs(st.powerMeter - 0.5) * 2;

      const speed = 5 + pPrec * 12;
      const launchA = -0.3 - aPrec * 0.5; // angle determines trajectory
      st.fg = {
        x: GILLI_X, y: st.gilliUpY,
        vx: speed * Math.cos(launchA),
        vy: speed * Math.sin(launchA),
        rotation: 0,
        rotSpeed: 0.12 + pPrec * 0.2,
      };
      st.swingTarget = -1.5;
      st.phase = "flying";
      st.mood = "focus";
      burst(GILLI_X, st.gilliUpY, colRef.current.accent, 15);
      st.flashTimer = 6;
      st.flashColor = colRef.current.accent;
      setUiPhase("flying");
      trackEvent("power_locked", { quality: Math.round(pPrec * 100) });
      return;
    }

    if (st.phase === "result") {
      st.round++;
      setUiRound(st.round);
      if (st.round >= ROUNDS) {
        st.phase = "gameover";
        st.mood = "idle";
        if (st.totalScore > st.bestScore) {
          st.bestScore = st.totalScore;
          localStorage.setItem("gilliPanda_best", String(st.totalScore));
          setUiBest(st.totalScore);
        }
        setUiPhase("gameover");
        trackEvent("game_over", { score: st.totalScore, newRecord: st.totalScore >= st.bestScore });
        onGameOver?.(st.totalScore);
      } else {
        startRound();
      }
    }
  }, [startGame, startRound, burst, inputBlocked, onGameOver]);

  /* ═══════════ GAME LOOP ═══════════ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const st = s.current;
      const c = colRef.current;
      st.frame++;

      /* ── UPDATE ── */

      // Angle meter
      if (st.phase === "angle") {
        st.angleMeter += st.angleMeterSpeed * st.angleMeterDir;
        if (st.angleMeter >= 1) { st.angleMeter = 1; st.angleMeterDir = -1; }
        if (st.angleMeter <= 0) { st.angleMeter = 0; st.angleMeterDir = 1; }
      }

      // Gilli rising after angle hit
      if (st.phase === "gilliUp") {
        st.gilliUpVY += GRAV * 0.4;
        st.gilliUpY += st.gilliUpVY;
        st.gilliUpAngle += 0.06;

        // When gilli reaches peak → switch to power meter
        if (st.gilliUpVY >= 0 && !st.gilliAtPeak) {
          st.gilliAtPeak = true;
          st.gilliUpY = Math.min(st.gilliUpY, GY - 130);
          st.gilliUpVY = 0;
          st.phase = "power";
          st.mood = "focus";
          setUiPhase("power");
        }
      }

      // Power meter
      if (st.phase === "power") {
        st.powerMeter += st.powerMeterSpeed * st.powerMeterDir;
        if (st.powerMeter >= 1) { st.powerMeter = 1; st.powerMeterDir = -1; }
        if (st.powerMeter <= 0) { st.powerMeter = 0; st.powerMeterDir = 1; }
        // Gilli hovers with slight wobble
        st.gilliUpY = GY - 130 + Math.sin(st.frame * 0.08) * 4;
        st.gilliUpAngle += 0.03;
      }

      // Flying gilli
      if (st.phase === "flying" && st.fg) {
        const fg = st.fg;
        fg.vy += GRAV;
        fg.x += fg.vx;
        fg.y += fg.vy;
        fg.rotation += fg.rotSpeed;

        // Camera
        if (fg.x > W * 0.4) st.camX = fg.x - W * 0.4;

        st.distMark = Math.max(st.distMark, Math.round((fg.x - GILLI_X) / 5));

        // Check obstacle collisions
        for (const obs of st.obstacles) {
          if (!obs.hit && Math.abs(fg.x - obs.x) < 25 && fg.y > GY - 50) {
            obs.hit = true;
            st.hitObstacle = obs;
            burst(obs.x - st.camX, GY - 20, "#ff6b6b", 12);
          }
        }

        // Landed
        if (fg.y >= GY) {
          fg.y = GY;
          const hitFood = st.hitObstacle !== null;
          const { distance, points, message } = calcScore(st.angleResult, st.powerResult, hitFood);
          st.resDist = distance;
          st.resMsg = message;
          st.totalScore += points;
          st.resTimer = 140;
          st.phase = "result";

          // Set mood based on result
          if (hitFood) {
            st.mood = "hungry";
            st.moodTimer = 90;
          } else if (distance > 85) {
            st.mood = "perfect";
          } else if (distance > 50) {
            st.mood = "happy";
          } else {
            st.mood = "frustrated";
          }

          setUiScore(st.totalScore);
          setUiPhase("result");
          burst(fg.x - st.camX, GY, "#8B7355", 12);
          st.flashTimer = 5;
          st.flashColor = hitFood ? c.miss : (points > 60 ? c.accent : c.score);
          trackEvent("round_complete", { round: st.round + 1, distance, points });
        }
      }

      // Mood timer
      if (st.moodTimer > 0) {
        st.moodTimer--;
        if (st.moodTimer <= 0 && st.mood === "hungry") {
          st.mood = "frustrated";
        }
      }

      // Panda swing lerp
      st.swing += (st.swingTarget - st.swing) * 0.12;

      // Particles
      st.particles = st.particles.filter((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
        return p.life > 0;
      });
      if (st.flashTimer > 0) st.flashTimer--;
      if (st.resTimer > 0) st.resTimer--;

      /* ── DRAW ── */

      // Sky gradient
      const skyG = ctx.createLinearGradient(0, 0, 0, GY);
      skyG.addColorStop(0, c.sky1);
      skyG.addColorStop(1, c.sky2);
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      const co = -st.camX * 0.08;
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 180 + 60 + co) % (W + 200)) - 100;
        const cy = 40 + (i * 41) % 90;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.arc(cx + 18, cy - 7, 18, 0, Math.PI * 2);
        ctx.arc(cx + 36, cy, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun with glow
      ctx.fillStyle = "#FFD700";
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(W - 75, 55, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.arc(W - 75, 55, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Mountains (background)
      ctx.fillStyle = "rgba(100,140,80,0.3)";
      const mOff = -st.camX * 0.05;
      ctx.beginPath();
      ctx.moveTo(0, GY);
      for (let mx = 0; mx <= W; mx += 60) {
        ctx.lineTo(mx, GY - 40 - Math.sin((mx + mOff) * 0.008) * 35 - Math.cos((mx + mOff) * 0.003) * 25);
      }
      ctx.lineTo(W, GY);
      ctx.fill();

      // Ground
      const gG = ctx.createLinearGradient(0, GY, 0, H);
      gG.addColorStop(0, c.ground1);
      gG.addColorStop(1, c.ground2);
      ctx.fillStyle = gG;
      ctx.fillRect(0, GY, W, H - GY);

      // Dirt strip
      ctx.fillStyle = c.dirt;
      ctx.fillRect(0, GY, W, 3);

      // Distance markers
      if (st.phase === "flying" || st.phase === "result") {
        ctx.font = "11px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        for (let d = 50; d <= 500; d += 50) {
          const mx = GILLI_X + d * 5 - st.camX;
          if (mx > 0 && mx < W) {
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(mx, GY - 8, 2, 18);
            ctx.fillStyle = "rgba(255,255,255,0.45)";
            ctx.fillText(`${d}m`, mx, GY + 28);
          }
        }
      }

      // Grass tufts
      ctx.fillStyle = "#6aad45";
      for (let i = 0; i < 22; i++) {
        const gx = ((i * 43 + 10 - st.camX * 0.5) % W);
        ctx.beginPath();
        ctx.moveTo(gx, GY);
        ctx.lineTo(gx - 3, GY - 7 - (i % 3) * 3);
        ctx.lineTo(gx + 3, GY - 5 - (i % 4) * 2);
        ctx.closePath();
        ctx.fill();
      }

      // Obstacles
      for (const obs of st.obstacles) {
        drawObstacle(ctx, obs, st.camX);
      }

      // Panda
      const pdx = (st.phase === "flying" || st.phase === "result") ? PX - st.camX : PX;
      if (pdx > -80 && pdx < W + 80) {
        drawPanda(ctx, pdx, GY, st.swing, st.mood, st.frame);
      }

      // Gilli on ground
      if (st.phase === "angle" || st.phase === "ready") {
        const ra = -0.4 + (st.phase === "angle" ? Math.sin(st.frame * 0.04) * 0.08 : 0);
        drawGilli(ctx, GILLI_X, GILLI_Y, ra);
        // Edge indicator glow
        if (st.phase === "angle") {
          ctx.fillStyle = "rgba(255,200,50,0.3)";
          ctx.beginPath();
          ctx.arc(GILLI_X, GILLI_Y - 18, 6 + Math.sin(st.frame * 0.1) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Gilli rising
      if (st.phase === "gilliUp" || st.phase === "power") {
        drawGilli(ctx, GILLI_X, st.gilliUpY, st.gilliUpAngle);
        // Glow at gilli position during power
        if (st.phase === "power") {
          ctx.strokeStyle = "rgba(255,200,50,0.4)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(GILLI_X, st.gilliUpY, 24 + Math.sin(st.frame * 0.1) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Flying gilli
      if (st.phase === "flying" && st.fg) {
        drawGilli(ctx, st.fg.x - st.camX, st.fg.y, st.fg.rotation);
        // Trail
        ctx.fillStyle = "rgba(212,168,85,0.3)";
        for (let t = 1; t <= 4; t++) {
          const r = 4 - t * 0.8;
          ctx.beginPath();
          ctx.arc(st.fg.x - st.camX - st.fg.vx * t * 2, st.fg.y - st.fg.vy * t * 0.4, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Landed gilli
      if (st.phase === "result" && st.fg) {
        drawGilli(ctx, st.fg.x - st.camX, GY - 2, -0.2);
        const fx = st.fg.x - st.camX;
        if (fx > 0 && fx < W) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx, GY); ctx.lineTo(fx, GY - 36);
          ctx.stroke();
          ctx.fillStyle = st.hitObstacle ? c.miss : c.accent;
          ctx.beginPath();
          ctx.moveTo(fx, GY - 36);
          ctx.lineTo(fx + 16, GY - 30);
          ctx.lineTo(fx, GY - 24);
          ctx.fill();
        }
      }

      // Particles
      for (const p of st.particles) {
        ctx.globalAlpha = p.life / 45;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Flash
      if (st.flashTimer > 0) {
        ctx.fillStyle = st.flashColor;
        ctx.globalAlpha = st.flashTimer / 20;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      /* ── HUD ── */
      if (st.phase !== "ready" && st.phase !== "gameover") {
        ctx.font = "bold 24px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(`Score: ${st.totalScore}`, 20, 36);
        ctx.font = "14px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(`Round ${st.round + 1} / ${ROUNDS}`, 20, 56);
        ctx.shadowBlur = 0;

        ctx.textAlign = "right";
        ctx.font = "14px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(`Best: ${st.bestScore}`, W - 16, 36);
      }

      // Angle meter
      if (st.phase === "angle") {
        drawMeter(ctx, W / 2 - 130, H - 85, 260, 26, st.angleMeter,
          "🎯 TAP to set angle", {
            bg: "rgba(0,0,0,0.45)", fill: "#f59e0b",
            perfect: "#22c55e", text: "#fff",
          });
        ctx.font = "13px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.textAlign = "center";
        ctx.fillText("Hit the gilli edge to flip it straight up!", W / 2, H - 45);
      }

      // Power meter
      if (st.phase === "power") {
        drawMeter(ctx, W / 2 - 130, H - 85, 260, 26, st.powerMeter,
          "💥 TAP for power!", {
            bg: "rgba(0,0,0,0.45)", fill: "#ef4444",
            perfect: "#22c55e", text: "#fff",
          });
        ctx.font = "13px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.textAlign = "center";
        ctx.fillText("Swing the danda! Avoid the food obstacles!", W / 2, H - 45);
      }

      // Flying distance
      if (st.phase === "flying") {
        ctx.font = "bold 30px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(`${st.distMark}m`, W / 2, 85);
        ctx.shadowBlur = 0;
      }

      // Result
      if (st.phase === "result") {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 6;

        ctx.font = "bold 34px 'Space Grotesk', sans-serif";
        ctx.fillStyle = st.hitObstacle ? c.miss : "#fff";
        ctx.fillText(st.resMsg, W / 2, 175);

        ctx.font = "bold 56px 'Space Grotesk', sans-serif";
        ctx.fillStyle = st.hitObstacle ? c.miss : c.score;
        ctx.fillText(`${st.resDist}m`, W / 2, 245);

        if (st.hitObstacle) {
          ctx.font = "16px 'Space Grotesk', sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fillText("Panda is hungry now... score penalty! 🐼💢", W / 2, 280);
        }

        const pulse = 0.6 + Math.sin(Date.now() / 350) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.font = "bold 20px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(st.round + 1 >= ROUNDS ? "▶  See Final Score" : "▶  Next Round", W / 2, 330);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // Ready screen
      if (st.phase === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";

        ctx.font = "12px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillText("brahmaastra.com", W / 2, 115);

        ctx.font = "bold 48px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText("🐼 Gilli Panda", W / 2, 170);

        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText("Flip the gilli up, then smash it — but watch out for food!", W / 2, 210);

        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillText("Click · Tap · Spacebar", W / 2, 242);

        const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.font = "bold 24px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.accent;
        ctx.fillText("▶  Start Game", W / 2, 300);
        ctx.globalAlpha = 1;

        if (st.bestScore > 0) {
          ctx.font = "16px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.score;
          ctx.fillText(`🏆 Best: ${st.bestScore}`, W / 2, 350);
        }
      }

      // Game over
      if (st.phase === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";

        ctx.font = "bold 40px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.miss;
        ctx.fillText("Game Over!", W / 2, 140);

        ctx.font = "bold 72px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.score;
        ctx.fillText(String(st.totalScore), W / 2, 225);

        ctx.font = "16px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("total points", W / 2, 252);

        if (st.totalScore >= st.bestScore && st.totalScore > 0) {
          ctx.font = "bold 22px 'Space Grotesk', sans-serif";
          ctx.fillStyle = c.accent;
          ctx.fillText("🌟 New Record!", W / 2, 292);
        } else {
          ctx.font = "14px 'Inter', sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillText(`Best: ${st.bestScore}`, W / 2, 292);
        }

        const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4;
        ctx.globalAlpha = pulse;
        ctx.font = "bold 22px 'Space Grotesk', sans-serif";
        ctx.fillStyle = c.accent;
        ctx.fillText("▶  Play Again", W / 2, 350);
        ctx.globalAlpha = 1;
      }

      // Watermark
      if (st.phase !== "ready" && st.phase !== "gameover") {
        ctx.textAlign = "right";
        ctx.font = "10px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillText("brahmaastra.com", W - 12, H - 10);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [burst]);

  /* ─── Input ─── */
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

  /* ─── Responsive ─── */
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      setScale(Math.min(1, containerRef.current.clientWidth / W));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center bg-background" style={{ minHeight: "520px" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleInput}
        onTouchStart={(e) => { e.preventDefault(); handleInput(); }}
        className="cursor-pointer rounded-lg"
        style={{ width: W * scale, height: H * scale, imageRendering: "auto" }}
      />
    </div>
  );
};

export default GilliDandaGame;
