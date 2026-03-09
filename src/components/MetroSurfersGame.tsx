import { useEffect, useRef, useCallback, useState } from "react";
import { sfxCollect, sfxPowerUp, sfxMiss, sfxGameOver, sfxStart, sfxWhoosh } from "@/lib/sounds";

/* ─── Types ─── */
type GameState = "ready" | "playing" | "gameover";
type Lane = 0 | 1 | 2;
type PlayerAction = "run" | "jump" | "slide" | "hit";

interface Obstacle {
  x: number; lane: Lane;
  type: "barrier" | "beam" | "train" | "pole" | "gap";
  width: number; height: number; yOffset: number;
}

interface Collectible {
  x: number; y: number; lane: Lane;
  type: "token" | "magnet" | "multiplier" | "jetpack";
  collected: boolean;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number;
}

/* ─── Constants ─── */
const W = 800, H = 520;
const LANE_X = [250, 400, 550];
const LANE_W = 100;
const GROUND_Y = 420;
const PLAYER_Y = GROUND_Y - 40;
const BASE_SPEED = 4;
const MAX_SPEED = 10;

function rand(a: number, b: number) { return a + Math.random() * (b - a); }
function randInt(a: number, b: number) { return Math.floor(rand(a, b + 1)); }
function randLane(): Lane { return randInt(0, 2) as Lane; }

interface Props {
  onGameOver?: (score: number) => void;
  inputBlocked?: boolean;
}

/* ─── Draw Runner ─── */
function drawRunner(ctx: CanvasRenderingContext2D, x: number, y: number, action: PlayerAction, t: number) {
  ctx.save();
  ctx.translate(x, y);

  const runBob = action === "run" ? Math.sin(t * 12) * 4 : 0;
  const jumpY = action === "jump" ? -40 : 0;
  const slideScale = action === "slide" ? 0.5 : 1;
  const hitFlash = action === "hit";

  ctx.translate(0, jumpY + runBob);
  ctx.scale(1, slideScale);

  if (hitFlash && Math.sin(t * 30) > 0) { ctx.globalAlpha = 0.4; }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 35 / slideScale, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const bodyGrad = ctx.createLinearGradient(-15, -25, 15, 20);
  bodyGrad.addColorStop(0, "#FF6B35");
  bodyGrad.addColorStop(1, "#CC4400");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-15, -20, 30, 40, 8);
  ctx.fill();
  ctx.strokeStyle = "#AA3300";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Head
  const headGrad = ctx.createRadialGradient(0, -30, 3, 0, -30, 14);
  headGrad.addColorStop(0, "#FFD5B4");
  headGrad.addColorStop(1, "#DEB887");
  ctx.beginPath();
  ctx.arc(0, -30, 12, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.strokeStyle = "#BFA070";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hair
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(0, -36, 10, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(-4, -32, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -32, 2, 0, Math.PI * 2); ctx.fill();

  // Headphones
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -35, 14, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.beginPath(); ctx.arc(-13, -30, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(13, -30, 4, 0, Math.PI * 2); ctx.fill();

  // Legs (running animation)
  if (action === "run") {
    const legPhase = Math.sin(t * 12);
    ctx.fillStyle = "#1a1a4e";
    ctx.fillRect(-8 + legPhase * 3, 18, 7, 14);
    ctx.fillRect(1 - legPhase * 3, 18, 7, 14);
    // Shoes
    ctx.fillStyle = "#FF4444";
    ctx.fillRect(-10 + legPhase * 3, 30, 10, 5);
    ctx.fillRect(-1 - legPhase * 3, 30, 10, 5);
  } else if (action === "slide") {
    ctx.fillStyle = "#1a1a4e";
    ctx.fillRect(-12, 18, 24, 8);
  } else {
    ctx.fillStyle = "#1a1a4e";
    ctx.fillRect(-8, 18, 7, 14);
    ctx.fillRect(1, 18, 7, 14);
    ctx.fillStyle = "#FF4444";
    ctx.fillRect(-10, 30, 10, 5);
    ctx.fillRect(-1, 30, 10, 5);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ═══════════════════════════════════════
   Metro Surfers — Canvas Game
   ═══════════════════════════════════════ */
export default function MetroSurfersGame({ onGameOver, inputBlocked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    state: "ready" as GameState,
    lane: 1 as Lane,
    targetLane: 1 as Lane,
    laneX: LANE_X[1],
    action: "run" as PlayerAction,
    score: 0,
    distance: 0,
    tokens: 0,
    speed: BASE_SPEED,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    jumpTimer: 0,
    slideTimer: 0,
    hitTimer: 0,
    lives: 3,
    multiplier: 1,
    multiplierTime: 0,
    magnetTime: 0,
    jetpackTime: 0,
    spawnTimer: 0,
    tokenTimer: 0,
    t: 0,
    trackOffset: 0,
    invincible: 0,
    bestScore: 0,
  });
  const [uiState, setUiState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const animRef = useRef<number>(0);

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
    s.lane = 1; s.targetLane = 1; s.laneX = LANE_X[1];
    s.action = "run";
    s.score = 0; s.distance = 0; s.tokens = 0;
    s.speed = BASE_SPEED; s.lives = 3;
    s.obstacles = []; s.collectibles = []; s.particles = [];
    s.jumpTimer = 0; s.slideTimer = 0; s.hitTimer = 0;
    s.multiplier = 1; s.multiplierTime = 0;
    s.magnetTime = 0; s.jetpackTime = 0;
    s.spawnTimer = 0; s.tokenTimer = 0; s.invincible = 0;
    setUiState("playing");
    setScore(0);
    sfxStart();
  }, []);

  const changeLane = useCallback((dir: -1 | 1) => {
    const s = stateRef.current;
    if (s.state !== "playing") return;
    s.lane = Math.max(0, Math.min(2, s.lane + dir)) as Lane;
    s.targetLane = s.lane;
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== "playing" || s.jumpTimer > 0 || s.slideTimer > 0) return;
    s.jumpTimer = 0.6;
    s.action = "jump";
  }, []);

  const slide = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== "playing" || s.jumpTimer > 0 || s.slideTimer > 0) return;
    s.slideTimer = 0.6;
    s.action = "slide";
  }, []);

  // Input
  useEffect(() => {
    if (inputBlocked) return;
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.state !== "playing" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault(); startGame(); return;
      }
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); changeLane(-1); }
      if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); changeLane(1); }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") { e.preventDefault(); jump(); }
      if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); slide(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inputBlocked, startGame, changeLane, jump, slide]);

  // Touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let sx = 0, sy = 0;
    const onStart = (e: TouchEvent) => {
      const s = stateRef.current;
      if (s.state !== "playing") { startGame(); return; }
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy)) {
        changeLane(dx > 0 ? 1 : -1);
      } else {
        if (dy < -20) jump();
        else if (dy > 20) slide();
      }
    };
    canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [startGame, changeLane, jump, slide]);

  // Click for start
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = () => {
      const s = stateRef.current;
      if (s.state !== "playing") startGame();
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

      if (s.state === "playing") {
        s.speed = Math.min(MAX_SPEED, s.speed + 0.001);
        s.distance += s.speed;
        s.score = Math.floor(s.distance / 10 * s.multiplier) + s.tokens * 10;
        s.trackOffset = (s.trackOffset + s.speed * 3) % 60;

        // Lane transition
        s.laneX += (LANE_X[s.lane] - s.laneX) * 0.2;

        // Timers
        if (s.jumpTimer > 0) { s.jumpTimer -= 0.016; if (s.jumpTimer <= 0) s.action = "run"; }
        if (s.slideTimer > 0) { s.slideTimer -= 0.016; if (s.slideTimer <= 0) s.action = "run"; }
        if (s.hitTimer > 0) { s.hitTimer -= 0.016; if (s.hitTimer <= 0) s.action = "run"; }
        if (s.invincible > 0) s.invincible -= 0.016;
        if (s.multiplierTime > 0) { s.multiplierTime -= 0.016; if (s.multiplierTime <= 0) s.multiplier = 1; }
        if (s.magnetTime > 0) s.magnetTime -= 0.016;
        if (s.jetpackTime > 0) s.jetpackTime -= 0.016;

        // Spawn obstacles
        s.spawnTimer -= 0.016;
        if (s.spawnTimer <= 0) {
          const lane = randLane();
          const types: Obstacle["type"][] = ["barrier", "barrier", "beam", "train", "pole"];
          const type = types[randInt(0, types.length - 1)];
          const configs: Record<string, { w: number; h: number; yo: number }> = {
            barrier: { w: 60, h: 30, yo: 0 },
            beam: { w: 80, h: 15, yo: -30 },
            train: { w: 70, h: 60, yo: 0 },
            pole: { w: 15, h: 50, yo: 0 },
            gap: { w: 80, h: 20, yo: 10 },
          };
          const cfg = configs[type];
          s.obstacles.push({
            x: W + 50, lane, type,
            width: cfg.w, height: cfg.h, yOffset: cfg.yo,
          });
          s.spawnTimer = rand(0.5, 1.5) / (s.speed / BASE_SPEED);
        }

        // Spawn tokens
        s.tokenTimer -= 0.016;
        if (s.tokenTimer <= 0) {
          const lane = randLane();
          const types: Collectible["type"][] = ["token", "token", "token", "token", "magnet", "multiplier", "jetpack"];
          const type = types[randInt(0, types.length - 1)];
          for (let i = 0; i < (type === "token" ? randInt(1, 4) : 1); i++) {
            s.collectibles.push({
              x: W + 50 + i * 30, y: PLAYER_Y - 10, lane, type, collected: false,
            });
          }
          s.tokenTimer = rand(0.6, 1.5);
        }

        // Move
        s.obstacles.forEach(o => { o.x -= s.speed * 1.5; });
        s.obstacles = s.obstacles.filter(o => o.x > -100);

        s.collectibles.forEach(c => { c.x -= s.speed * 1.5; });

        // Magnet
        if (s.magnetTime > 0) {
          s.collectibles.forEach(c => {
            if (!c.collected) {
              const dx = s.laneX - c.x;
              const dy = PLAYER_Y - c.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 200) { c.x += dx * 0.08; c.y += dy * 0.08; }
            }
          });
        }

        // Collision with obstacles
        s.obstacles.forEach(o => {
          const ox = LANE_X[o.lane];
          const dx = Math.abs(s.laneX - o.x);
          if (dx < (30 + o.width / 2) * 0.5 && s.lane === o.lane) {
            // Check if jump avoids barrier, or slide avoids beam
            if (o.type === "beam" && s.action === "slide") return;
            if ((o.type === "barrier" || o.type === "pole") && s.action === "jump") return;

            if (s.invincible <= 0) {
              s.lives--;
              s.hitTimer = 0.5;
              s.action = "hit";
              s.invincible = 1.5;
              addParticles(s.laneX, PLAYER_Y, "#FF4444", 15);
              o.x = -200; // remove
              if (s.lives <= 0) {
                s.state = "gameover";
                if (s.score > s.bestScore) s.bestScore = s.score;
                setUiState("gameover");
                setScore(s.score);
                onGameOver?.(s.score);
              }
            }
          }
        });

        // Collect tokens
        s.collectibles.forEach(c => {
          if (c.collected) return;
          const dx = Math.abs(s.laneX - c.x);
          if (dx < 30 && s.lane === c.lane) {
            c.collected = true;
            if (c.type === "token") {
              s.tokens++;
              addParticles(c.x, c.y, "#FFD700", 5);
            } else if (c.type === "magnet") {
              s.magnetTime = 8;
              addParticles(c.x, c.y, "#FF4444", 8);
            } else if (c.type === "multiplier") {
              s.multiplier = 2;
              s.multiplierTime = 10;
              addParticles(c.x, c.y, "#9B59B6", 8);
            } else if (c.type === "jetpack") {
              s.jetpackTime = 5;
              addParticles(c.x, c.y, "#FF6600", 8);
            }
          }
        });
        s.collectibles = s.collectibles.filter(c => c.x > -50 && !c.collected);

        // Particles
        s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.03; });
        s.particles = s.particles.filter(p => p.life > 0);

        setScore(s.score);
      }

      // ─── Draw ───
      // Underground metro background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#0a0a1a");
      bgGrad.addColorStop(0.3, "#141428");
      bgGrad.addColorStop(0.6, "#1a1a30");
      bgGrad.addColorStop(1, "#222240");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Tunnel walls
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, 150, H);
      ctx.fillRect(650, 0, 150, H);

      // Neon lights
      for (let i = 0; i < 5; i++) {
        const ly = i * 110 + ((s.trackOffset * 0.5) % 110);
        ctx.strokeStyle = `rgba(0,200,255,${0.1 + Math.sin(s.t + i) * 0.05})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(160, ly); ctx.lineTo(640, ly); ctx.stroke();
      }

      // Track perspective lines
      for (let i = 0; i < 3; i++) {
        const lx = LANE_X[i];
        ctx.strokeStyle = "rgba(100,100,150,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(lx - LANE_W / 2, 0); ctx.lineTo(lx - LANE_W / 2, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + LANE_W / 2, 0); ctx.lineTo(lx + LANE_W / 2, H); ctx.stroke();
      }

      // Rails
      ctx.strokeStyle = "rgba(180,180,200,0.4)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(LANE_X[i] - 25, GROUND_Y); ctx.lineTo(LANE_X[i] - 25, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(LANE_X[i] + 25, GROUND_Y); ctx.lineTo(LANE_X[i] + 25, 0); ctx.stroke();
      }

      // Railway ties
      for (let i = 0; i < 3; i++) {
        for (let y = -s.trackOffset % 30; y < H; y += 30) {
          ctx.fillStyle = "rgba(100,80,60,0.3)";
          ctx.fillRect(LANE_X[i] - 30, GROUND_Y - y, 60, 4);
        }
      }

      // Ground
      ctx.fillStyle = "#2a2a40";
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      if (s.state === "playing" || s.state === "gameover") {
        // Draw collectibles
        s.collectibles.forEach(c => {
          if (c.collected) return;
          const bob = Math.sin(s.t * 3 + c.x) * 3;
          ctx.save();
          ctx.translate(c.x, PLAYER_Y - 10 + bob);

          if (c.type === "token") {
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#FFD700";
            ctx.fill();
            ctx.strokeStyle = "#B8860B";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#8B6914";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("M", 0, 1);
          } else {
            ctx.font = "20px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const emojis = { magnet: "🧲", multiplier: "✖️", jetpack: "🚀" };
            ctx.fillText(emojis[c.type as keyof typeof emojis] || "⭐", 0, 0);
          }
          ctx.restore();
        });

        // Draw obstacles
        s.obstacles.forEach(o => {
          const ox = LANE_X[o.lane];
          ctx.save();
          ctx.translate(o.x, GROUND_Y + o.yOffset);

          if (o.type === "barrier") {
            ctx.fillStyle = "#FF6B35";
            ctx.beginPath(); ctx.roundRect(-o.width / 2, -o.height, o.width, o.height, 4); ctx.fill();
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(-o.width / 2 + 5, -o.height + 5, o.width - 10, 4);
            ctx.fillRect(-o.width / 2 + 5, -o.height + 15, o.width - 10, 4);
          } else if (o.type === "beam") {
            ctx.fillStyle = "#888";
            ctx.fillRect(-o.width / 2, -o.height, o.width, o.height);
            ctx.fillStyle = "#FF0";
            ctx.fillRect(-o.width / 2, -o.height, 5, o.height);
            ctx.fillRect(o.width / 2 - 5, -o.height, 5, o.height);
          } else if (o.type === "train") {
            const tGrad = ctx.createLinearGradient(-o.width / 2, -o.height, o.width / 2, 0);
            tGrad.addColorStop(0, "#3498DB");
            tGrad.addColorStop(1, "#2471A3");
            ctx.fillStyle = tGrad;
            ctx.beginPath(); ctx.roundRect(-o.width / 2, -o.height, o.width, o.height, 6); ctx.fill();
            ctx.fillStyle = "rgba(135,206,250,0.5)";
            ctx.fillRect(-o.width / 2 + 8, -o.height + 8, 15, 20);
            ctx.fillRect(o.width / 2 - 23, -o.height + 8, 15, 20);
            ctx.strokeStyle = "#1a5276";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(-o.width / 2, -o.height, o.width, o.height, 6); ctx.stroke();
          } else if (o.type === "pole") {
            ctx.fillStyle = "#777";
            ctx.fillRect(-4, -o.height, 8, o.height);
            ctx.fillStyle = "#999";
            ctx.beginPath(); ctx.arc(0, -o.height, 6, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        });

        // Draw player
        drawRunner(ctx, s.laneX, PLAYER_Y, s.action, s.t);

        // Jetpack flames
        if (s.jetpackTime > 0) {
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(s.laneX - 8 + rand(-3, 3), PLAYER_Y + 20 + i * 8, rand(3, 7), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,${100 + i * 50},0,${0.7 - i * 0.2})`;
            ctx.fill();
          }
        }
      }

      // Particles
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // HUD
      if (s.state === "playing") {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath(); ctx.roundRect(10, 10, 200, 55, 8); ctx.fill();
        ctx.fillStyle = "#00BFFF";
        ctx.font = "bold 18px 'Baloo 2', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${s.score}`, 20, 33);
        ctx.fillStyle = "#FFD700";
        ctx.font = "13px sans-serif";
        ctx.fillText(`Tokens: ${s.tokens}  |  ${Math.floor(s.distance / 10)}m`, 20, 53);

        // Lives
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath(); ctx.roundRect(W - 110, 10, 100, 30, 8); ctx.fill();
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        for (let i = 0; i < 3; i++) {
          ctx.fillText(i < s.lives ? "💜" : "🖤", W - 85 + i * 28, 30);
        }

        // Power-up indicators
        let py = 48;
        if (s.multiplierTime > 0) {
          ctx.fillStyle = "rgba(155,89,182,0.7)";
          ctx.beginPath(); ctx.roundRect(W - 110, py, 100, 16, 5); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`2x Score ${s.multiplierTime.toFixed(1)}s`, W - 60, py + 12);
          py += 20;
        }
        if (s.magnetTime > 0) {
          ctx.fillStyle = "rgba(255,68,68,0.7)";
          ctx.beginPath(); ctx.roundRect(W - 110, py, 100, 16, 5); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`🧲 Magnet ${s.magnetTime.toFixed(1)}s`, W - 60, py + 12);
          py += 20;
        }
        if (s.jetpackTime > 0) {
          ctx.fillStyle = "rgba(255,102,0,0.7)";
          ctx.beginPath(); ctx.roundRect(W - 110, py, 100, 16, 5); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`🚀 Jetpack ${s.jetpackTime.toFixed(1)}s`, W - 60, py + 12);
        }

        // Speed bar
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath(); ctx.roundRect(220, 15, 120, 14, 5); ctx.fill();
        const spd = (s.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
        ctx.fillStyle = `hsl(${200 - spd * 120}, 80%, 50%)`;
        ctx.beginPath(); ctx.roundRect(222, 17, 116 * spd, 10, 4); ctx.fill();
        ctx.fillStyle = "#aaa"; ctx.font = "8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(`${Math.floor(s.speed * 15)} km/h`, 280, 27);
      }

      // Ready
      if (s.state === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#00BFFF";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🚇 Metro Surfers", W / 2, H / 2 - 50);
        ctx.fillStyle = "#B0C4DE";
        ctx.font = "16px sans-serif";
        ctx.fillText("Run • Jump • Slide • Collect tokens!", W / 2, H / 2 - 10);
        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("[ Click / Tap / Space to Start ]", W / 2, H / 2 + 35);
        ctx.fillStyle = "#aaa";
        ctx.font = "13px sans-serif";
        ctx.fillText("← → Lanes  |  ↑ Jump  |  ↓ Slide", W / 2, H / 2 + 65);
        drawRunner(ctx, W / 2, H / 2 + 130, "run", s.t);
      }

      // Game over
      if (s.state === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FF4444";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💥 Busted!", W / 2, H / 2 - 60);
        ctx.fillStyle = "#00BFFF";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 - 15);
        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Distance: ${Math.floor(s.distance / 10)}m  |  Tokens: ${s.tokens}`, W / 2, H / 2 + 20);
        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("[ Click / Tap / Space to Retry ]", W / 2, H / 2 + 65);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [onGameOver, addParticles]);

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
