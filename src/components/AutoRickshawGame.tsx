import { useEffect, useRef, useCallback, useState } from "react";
import { sfxCollect, sfxPowerUp, sfxMiss, sfxGameOver, sfxStart, sfxWhoosh } from "@/lib/sounds";

/* ─── Types ─── */
type GameState = "ready" | "playing" | "gameover";
type Lane = 0 | 1 | 2;

interface Vehicle {
  x: number; y: number; lane: Lane;
  type: "car" | "bus" | "cow" | "pothole" | "bike";
  width: number; height: number; speed: number;
  color: string; passed: boolean;
}

interface Collectible {
  x: number; y: number; lane: Lane;
  type: "coin" | "fare" | "shield" | "magnet" | "boost";
  collected: boolean;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number;
}

/* ─── Constants ─── */
const W = 800, H = 520;
const LANE_Y = [180, 290, 400];
const LANE_W = 90;
const BASE_SPEED = 2.5;
const MAX_SPEED = 7;
const ACCEL = 0.0008;

/* ─── Helpers ─── */
function hsl(varName: string, fb: string): string {
  if (typeof document === "undefined") return fb;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `hsl(${v})` : fb;
}

function rand(a: number, b: number) { return a + Math.random() * (b - a); }
function randInt(a: number, b: number) { return Math.floor(rand(a, b + 1)); }
function randLane(): Lane { return randInt(0, 2) as Lane; }

interface Props {
  onGameOver?: (score: number) => void;
  inputBlocked?: boolean;
}

/* ─── Draw Rickshaw ─── */
function drawRickshaw(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt * 0.03);

  // Body
  const bodyGrad = ctx.createLinearGradient(-25, -30, 25, 10);
  bodyGrad.addColorStop(0, "#FFD700");
  bodyGrad.addColorStop(0.5, "#FFA500");
  bodyGrad.addColorStop(1, "#FF8C00");

  // Main body
  ctx.beginPath();
  ctx.roundRect(-28, -28, 56, 38, 8);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = "#CC7000";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Roof
  ctx.beginPath();
  ctx.roundRect(-24, -38, 48, 14, [6, 6, 0, 0]);
  ctx.fillStyle = "#228B22";
  ctx.fill();
  ctx.strokeStyle = "#1a6b1a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Stripes
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(-20, -36, 40, 3);
  ctx.fillStyle = "#FF4500";
  ctx.fillRect(-20, -32, 40, 2);

  // Windshield
  ctx.beginPath();
  ctx.roundRect(-18, -24, 20, 16, 3);
  ctx.fillStyle = "rgba(135,206,250,0.7)";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Headlight
  ctx.beginPath();
  ctx.arc(28, -15, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFF88";
  ctx.fill();
  ctx.strokeStyle = "#CCA000";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Front wheel
  ctx.beginPath();
  ctx.arc(22, 14, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#222";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 14, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#666";
  ctx.fill();

  // Back wheel
  ctx.beginPath();
  ctx.arc(-18, 14, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#222";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-18, 14, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#666";
  ctx.fill();

  // Driver silhouette
  ctx.beginPath();
  ctx.arc(-6, -18, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#8B4513";
  ctx.fill();

  ctx.restore();
}

/* ─── Draw Obstacles ─── */
function drawVehicle(ctx: CanvasRenderingContext2D, v: Vehicle) {
  ctx.save();
  ctx.translate(v.x, v.y);

  if (v.type === "car") {
    const g = ctx.createLinearGradient(-20, -15, 20, 15);
    g.addColorStop(0, v.color);
    g.addColorStop(1, "#333");
    ctx.beginPath();
    ctx.roundRect(-v.width / 2, -v.height / 2, v.width, v.height, 6);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Windows
    ctx.fillStyle = "rgba(135,206,250,0.5)";
    ctx.fillRect(-12, -v.height / 2 + 3, 10, 8);
    // Wheels
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(-15, v.height / 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(15, v.height / 2, 5, 0, Math.PI * 2); ctx.fill();
  } else if (v.type === "bus") {
    ctx.beginPath();
    ctx.roundRect(-v.width / 2, -v.height / 2, v.width, v.height, 4);
    ctx.fillStyle = v.color;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Windows
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = "rgba(135,206,250,0.6)";
      ctx.fillRect(-v.width / 2 + 6 + i * 16, -v.height / 2 + 4, 10, 10);
    }
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(-25, v.height / 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(25, v.height / 2, 6, 0, Math.PI * 2); ctx.fill();
  } else if (v.type === "cow") {
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#F5F5DC";
    ctx.fill();
    ctx.strokeStyle = "#8B7355";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Spots
    ctx.fillStyle = "#8B4513";
    ctx.beginPath(); ctx.ellipse(-8, -4, 6, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, 2, 5, 3, -0.2, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.beginPath();
    ctx.ellipse(22, -5, 10, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#F5F5DC";
    ctx.fill();
    ctx.stroke();
    // Eyes
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(26, -7, 2, 0, Math.PI * 2); ctx.fill();
    // Horns
    ctx.strokeStyle = "#8B7355";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(18, -12); ctx.lineTo(16, -20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24, -12); ctx.lineTo(26, -20); ctx.stroke();
    // Legs
    ctx.fillStyle = "#F5F5DC";
    ctx.fillRect(-14, 10, 5, 10);
    ctx.fillRect(-4, 10, 5, 10);
    ctx.fillRect(6, 10, 5, 10);
    ctx.fillRect(14, 10, 5, 10);
  } else if (v.type === "pothole") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -2, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#555";
    ctx.fill();
  } else if (v.type === "bike") {
    ctx.beginPath();
    ctx.roundRect(-15, -10, 30, 20, 4);
    ctx.fillStyle = v.color;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(-10, 12, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 12, 5, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

function drawCollectible(ctx: CanvasRenderingContext2D, c: Collectible, t: number) {
  if (c.collected) return;
  ctx.save();
  ctx.translate(c.x, c.y);
  const bob = Math.sin(t * 3 + c.x) * 3;
  ctx.translate(0, bob);

  if (c.type === "coin") {
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.strokeStyle = "#DAA520";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#B8860B";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₹", 0, 1);
  } else if (c.type === "fare") {
    ctx.beginPath();
    ctx.roundRect(-12, -8, 24, 16, 3);
    ctx.fillStyle = "#90EE90";
    ctx.fill();
    ctx.strokeStyle = "#228B22";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#006400";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₹₹", 0, 1);
  } else if (c.type === "shield") {
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, -4);
    ctx.lineTo(8, 8);
    ctx.lineTo(0, 12);
    ctx.lineTo(-8, 8);
    ctx.lineTo(-10, -4);
    ctx.closePath();
    ctx.fillStyle = "#4169E1";
    ctx.fill();
    ctx.strokeStyle = "#1E3A8A";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡", 0, 0);
  } else if (c.type === "magnet") {
    ctx.fillStyle = "#FF4444";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧲", 0, 0);
  } else if (c.type === "boost") {
    ctx.fillStyle = "#FF6600";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚡", 0, 0);
  }

  ctx.restore();
}

/* ═══════════════════════════════════════
   AutoRickshaw Rampage — Canvas Game
   ═══════════════════════════════════════ */
export default function AutoRickshawGame({ onGameOver, inputBlocked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    state: "ready" as GameState,
    lane: 1 as Lane,
    targetLane: 1 as Lane,
    laneY: LANE_Y[1],
    rickX: 120,
    score: 0,
    distance: 0,
    fares: 0,
    speed: BASE_SPEED,
    vehicles: [] as Vehicle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    shieldTime: 0,
    magnetTime: 0,
    boostTime: 0,
    lives: 3,
    hitFlash: 0,
    tilt: 0,
    roadOffset: 0,
    spawnTimer: 0,
    coinTimer: 0,
    t: 0,
    combo: 0,
    bestCombo: 0,
    invincibleTime: 0,
  });
  const [uiState, setUiState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const animRef = useRef<number>(0);

  const spawnVehicle = useCallback(() => {
    const s = stateRef.current;
    const lane = randLane();
    const types: Vehicle["type"][] = ["car", "car", "car", "bus", "cow", "pothole", "bike"];
    const type = types[randInt(0, types.length - 1)];
    const dims = {
      car: { w: 40, h: 28 }, bus: { w: 70, h: 30 }, cow: { w: 50, h: 30 },
      pothole: { w: 40, h: 20 }, bike: { w: 30, h: 22 },
    };
    const colors = ["#E74C3C", "#3498DB", "#2ECC71", "#9B59B6", "#E67E22", "#1ABC9C", "#F39C12"];
    const d = dims[type];
    s.vehicles.push({
      x: W + 50, y: LANE_Y[lane], lane,
      type, width: d.w, height: d.h,
      speed: s.speed * rand(0.6, 1.1),
      color: colors[randInt(0, colors.length - 1)],
      passed: false,
    });
  }, []);

  const spawnCollectible = useCallback(() => {
    const s = stateRef.current;
    const lane = randLane();
    const types: Collectible["type"][] = ["coin", "coin", "coin", "fare", "shield", "magnet", "boost"];
    const type = types[randInt(0, types.length - 1)];
    s.collectibles.push({
      x: W + 30, y: LANE_Y[lane], lane, type, collected: false,
    });
  }, []);

  const addParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      s.particles.push({
        x, y, vx: rand(-3, 3), vy: rand(-4, 1),
        life: 1, color, size: rand(2, 5),
      });
    }
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.state = "playing";
    s.lane = 1; s.targetLane = 1; s.laneY = LANE_Y[1];
    s.score = 0; s.distance = 0; s.fares = 0;
    s.speed = BASE_SPEED; s.lives = 3;
    s.vehicles = []; s.collectibles = []; s.particles = [];
    s.shieldTime = 0; s.magnetTime = 0; s.boostTime = 0;
    s.hitFlash = 0; s.tilt = 0; s.combo = 0; s.bestCombo = 0;
    s.spawnTimer = 0; s.coinTimer = 0; s.invincibleTime = 0;
    setUiState("playing");
    setLives(3);
    setScore(0);
    setCombo(0);
    setShieldActive(false);
    sfxStart();
  }, []);

  const changeLane = useCallback((dir: -1 | 1) => {
    const s = stateRef.current;
    if (s.state !== "playing") return;
    const newLane = Math.max(0, Math.min(2, s.lane + dir)) as Lane;
    s.lane = newLane;
    s.targetLane = newLane;
    s.tilt = dir * 1.5;
  }, []);

  // Input handling
  useEffect(() => {
    if (inputBlocked) return;
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.state === "ready" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault(); startGame(); return;
      }
      if (s.state === "gameover" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault(); startGame(); return;
      }
      if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); changeLane(-1); }
      if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); changeLane(1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inputBlocked, startGame, changeLane]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      const s = stateRef.current;
      if (s.state === "ready" || s.state === "gameover") { startGame(); return; }
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dy) > 20) {
        changeLane(dy < 0 ? -1 : 1);
      }
    };
    canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [startGame, changeLane]);

  // Click for start
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = () => {
      const s = stateRef.current;
      if (s.state === "ready" || s.state === "gameover") startGame();
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [startGame]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const loop = () => {
      const s = stateRef.current;
      s.t += 0.016;

      // ─── Update ───
      if (s.state === "playing") {
        const dt = 1;
        s.speed = Math.min(MAX_SPEED, s.speed + ACCEL * dt);
        const effectiveSpeed = s.boostTime > 0 ? s.speed * 1.6 : s.speed;
        s.distance += effectiveSpeed;
        s.score = Math.floor(s.distance / 10) + s.fares * 50;
        s.roadOffset = (s.roadOffset + effectiveSpeed * 2) % 60;

        // Smooth lane transition
        const targetY = LANE_Y[s.lane];
        s.laneY += (targetY - s.laneY) * 0.15;
        s.tilt *= 0.92;

        // Timers
        if (s.shieldTime > 0) s.shieldTime -= 0.016;
        if (s.magnetTime > 0) s.magnetTime -= 0.016;
        if (s.boostTime > 0) s.boostTime -= 0.016;
        if (s.hitFlash > 0) s.hitFlash -= 0.016;
        if (s.invincibleTime > 0) s.invincibleTime -= 0.016;

        // Spawn
        s.spawnTimer -= 0.016;
        if (s.spawnTimer <= 0) {
          spawnVehicle();
          s.spawnTimer = rand(0.6, 1.8) / (s.speed / BASE_SPEED);
        }
        s.coinTimer -= 0.016;
        if (s.coinTimer <= 0) {
          spawnCollectible();
          s.coinTimer = rand(0.8, 2.0);
        }

        // Move vehicles
        s.vehicles.forEach(v => { v.x -= effectiveSpeed + v.speed * 0.3; });
        s.vehicles = s.vehicles.filter(v => v.x > -100);

        // Move collectibles
        s.collectibles.forEach(c => { c.x -= effectiveSpeed; });

        // Magnet effect
        if (s.magnetTime > 0) {
          s.collectibles.forEach(c => {
            if (!c.collected) {
              const dx = s.rickX - c.x;
              const dy = s.laneY - c.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 150) {
                c.x += dx * 0.08;
                c.y += dy * 0.08;
              }
            }
          });
        }

        // Collision with vehicles
        const rW = 30, rH = 20;
        s.vehicles.forEach(v => {
          if (v.passed) return;
          const dx = Math.abs(s.rickX - v.x);
          const dy = Math.abs(s.laneY - v.y);
          if (dx < (rW + v.width / 2) * 0.6 && dy < (rH + v.height / 2) * 0.6) {
            if (s.shieldTime > 0) {
              v.passed = true;
              s.shieldTime = 0;
              addParticles(v.x, v.y, "#4169E1", 15);
              setShieldActive(false);
            } else if (s.invincibleTime <= 0) {
              v.passed = true;
              s.lives--;
              s.hitFlash = 0.5;
              s.invincibleTime = 1.5;
              s.combo = 0;
              addParticles(s.rickX, s.laneY, "#FF4444", 20);
              setLives(s.lives);
              setCombo(0);
              if (s.lives <= 0) {
                s.state = "gameover";
                setUiState("gameover");
                setScore(s.score);
                onGameOver?.(s.score);
              }
            }
          } else if (v.x < s.rickX - 40 && !v.passed) {
            v.passed = true;
            s.combo++;
            if (s.combo > s.bestCombo) s.bestCombo = s.combo;
            setCombo(s.combo);
          }
        });

        // Collision with collectibles
        s.collectibles.forEach(c => {
          if (c.collected) return;
          const dx = Math.abs(s.rickX - c.x);
          const dy = Math.abs(s.laneY - c.y);
          if (dx < 25 && dy < 25) {
            c.collected = true;
            if (c.type === "coin") {
              s.fares += 1;
              addParticles(c.x, c.y, "#FFD700", 8);
            } else if (c.type === "fare") {
              s.fares += 5;
              addParticles(c.x, c.y, "#90EE90", 12);
            } else if (c.type === "shield") {
              s.shieldTime = 8;
              addParticles(c.x, c.y, "#4169E1", 10);
              setShieldActive(true);
            } else if (c.type === "magnet") {
              s.magnetTime = 6;
              addParticles(c.x, c.y, "#FF4444", 10);
            } else if (c.type === "boost") {
              s.boostTime = 4;
              addParticles(c.x, c.y, "#FF6600", 10);
            }
          }
        });
        s.collectibles = s.collectibles.filter(c => c.x > -50 && !c.collected);

        // Particles
        s.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.03;
        });
        s.particles = s.particles.filter(p => p.life > 0);

        setScore(s.score);
      }

      // ─── Draw ───
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#87CEEB");
      skyGrad.addColorStop(0.4, "#B0E0E6");
      skyGrad.addColorStop(1, "#F0E68C");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Sun
      ctx.beginPath();
      ctx.arc(650, 60, 30, 0, Math.PI * 2);
      const sunGrad = ctx.createRadialGradient(650, 60, 5, 650, 60, 40);
      sunGrad.addColorStop(0, "#FFF8DC");
      sunGrad.addColorStop(0.5, "#FFD700");
      sunGrad.addColorStop(1, "rgba(255,215,0,0)");
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Buildings
      const buildingColors = ["#8B7355", "#A0522D", "#CD853F", "#DEB887", "#B8860B"];
      for (let i = 0; i < 12; i++) {
        const bx = i * 70 - ((s.roadOffset * 0.3) % 70);
        const bh = 40 + Math.sin(i * 2.3) * 25;
        ctx.fillStyle = buildingColors[i % buildingColors.length];
        ctx.fillRect(bx, 120 - bh, 55, bh + 20);
        // Windows
        ctx.fillStyle = "rgba(255,255,200,0.6)";
        for (let wy = 0; wy < bh - 10; wy += 12) {
          for (let wx = 0; wx < 40; wx += 14) {
            ctx.fillRect(bx + 8 + wx, 120 - bh + 8 + wy, 6, 6);
          }
        }
      }

      // Road
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 140, W, H - 140);

      // Lane dividers
      ctx.setLineDash([20, 15]);
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      for (let i = 0; i < 2; i++) {
        const ly = (LANE_Y[i] + LANE_Y[i + 1]) / 2;
        ctx.beginPath();
        ctx.moveTo(-s.roadOffset % 35, ly);
        ctx.lineTo(W, ly);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Road edges
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(0, 145, W, 3);
      ctx.fillRect(0, H - 30, W, 3);

      // Road markings moving
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let x = -s.roadOffset % 60; x < W; x += 60) {
        ctx.fillRect(x, 145, 30, H - 175);
      }

      // Draw collectibles
      s.collectibles.forEach(c => drawCollectible(ctx, c, s.t));

      // Draw vehicles
      s.vehicles.forEach(v => drawVehicle(ctx, v));

      // Draw rickshaw
      if (s.state === "playing" || s.state === "gameover") {
        if (s.invincibleTime <= 0 || Math.sin(s.t * 20) > 0) {
          // Shield glow
          if (s.shieldTime > 0) {
            ctx.beginPath();
            ctx.arc(s.rickX, s.laneY, 35, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(65,105,225,${0.5 + Math.sin(s.t * 4) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.stroke();
          }
          // Boost trail
          if (s.boostTime > 0) {
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.arc(s.rickX - 30 - i * 12, s.laneY + rand(-5, 5), rand(3, 8), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255,100,0,${0.5 - i * 0.15})`;
              ctx.fill();
            }
          }
          drawRickshaw(ctx, s.rickX, s.laneY, s.tilt);
        }
      }

      // Hit flash
      if (s.hitFlash > 0) {
        ctx.fillStyle = `rgba(255,0,0,${s.hitFlash * 0.3})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Particles
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // HUD
      if (s.state === "playing") {
        // Score panel
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.roundRect(10, 10, 180, 55, 8);
        ctx.fill();
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 18px 'Baloo 2', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${s.score}`, 20, 33);
        ctx.fillStyle = "#90EE90";
        ctx.font = "13px sans-serif";
        ctx.fillText(`Fares: ₹${s.fares * 10}  |  Combo: ${s.combo}x`, 20, 53);

        // Lives
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.roundRect(W - 110, 10, 100, 30, 8);
        ctx.fill();
        ctx.fillStyle = "#FF4444";
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        for (let i = 0; i < 3; i++) {
          ctx.fillText(i < s.lives ? "❤️" : "🖤", W - 85 + i * 28, 32);
        }

        // Speed indicator
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.roundRect(W - 110, 48, 100, 20, 6);
        ctx.fill();
        const speedPct = (s.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
        ctx.fillStyle = `hsl(${120 - speedPct * 120}, 80%, 50%)`;
        ctx.beginPath();
        ctx.roundRect(W - 108, 50, 96 * speedPct, 16, 5);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.floor(s.speed * 20)} km/h`, W - 60, 62);

        // Power-up indicators
        let py = 78;
        if (s.shieldTime > 0) {
          ctx.fillStyle = "rgba(65,105,225,0.7)";
          ctx.beginPath(); ctx.roundRect(W - 110, py, 100, 16, 5); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif";
          ctx.fillText(`🛡 Shield ${s.shieldTime.toFixed(1)}s`, W - 60, py + 12);
          py += 20;
        }
        if (s.magnetTime > 0) {
          ctx.fillStyle = "rgba(255,68,68,0.7)";
          ctx.beginPath(); ctx.roundRect(W - 110, py, 100, 16, 5); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif";
          ctx.fillText(`🧲 Magnet ${s.magnetTime.toFixed(1)}s`, W - 60, py + 12);
          py += 20;
        }
        if (s.boostTime > 0) {
          ctx.fillStyle = "rgba(255,102,0,0.7)";
          ctx.beginPath(); ctx.roundRect(W - 110, py, 100, 16, 5); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif";
          ctx.fillText(`⚡ Boost ${s.boostTime.toFixed(1)}s`, W - 60, py + 12);
        }
      }

      // Ready screen
      if (s.state === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🛺 AutoRickshaw Rampage", W / 2, H / 2 - 40);

        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText("Dodge traffic • Collect fares • Survive!", W / 2, H / 2 + 5);

        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("[ Click / Tap / Press Space to Start ]", W / 2, H / 2 + 45);

        ctx.fillStyle = "#aaa";
        ctx.font = "13px sans-serif";
        ctx.fillText("↑↓ or Swipe to change lanes", W / 2, H / 2 + 75);

        drawRickshaw(ctx, W / 2, H / 2 + 130, 0);
      }

      // Game over screen
      if (s.state === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#FF4444";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💥 GAME OVER", W / 2, H / 2 - 60);

        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 - 15);

        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Distance: ${Math.floor(s.distance / 10)}m  |  Fares: ₹${s.fares * 10}  |  Best Combo: ${s.bestCombo}x`, W / 2, H / 2 + 20);

        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("[ Click / Tap / Space to Retry ]", W / 2, H / 2 + 65);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [onGameOver, spawnVehicle, spawnCollectible, addParticles]);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full h-full rounded-xl"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
