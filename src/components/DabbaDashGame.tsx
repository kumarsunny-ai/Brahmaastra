import { useEffect, useRef, useCallback, useState } from "react";
import { sfxCollect, sfxLevelComplete, sfxGameOver, sfxStart } from "@/lib/sounds";

/* ─── Types ─── */
type GameState = "ready" | "playing" | "levelComplete" | "gameover";
type CellType = "empty" | "road" | "building" | "start" | "end" | "path";

interface GridCell {
  type: CellType;
  color: string;
  dabbaId?: number;
}

interface Dabba {
  id: number;
  startX: number; startY: number;
  endX: number; endY: number;
  color: string;
  emoji: string;
  path: { x: number; y: number }[];
  delivered: boolean;
  currentPathIdx: number;
  animX: number; animY: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number; text?: string;
}

/* ─── Constants ─── */
const W = 800, H = 520;
const GRID_COLS = 12, GRID_ROWS = 8;
const CELL_W = 50, CELL_H = 50;
const GRID_X = (W - GRID_COLS * CELL_W) / 2;
const GRID_Y = 70;

const DABBA_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
const DABBA_EMOJIS = ["📦", "🍱", "🥘", "🍛", "🍲", "🥡"];

function rand(a: number, b: number) { return a + Math.random() * (b - a); }
function randInt(a: number, b: number) { return Math.floor(rand(a, b + 1)); }

interface Props {
  onGameOver?: (score: number) => void;
  inputBlocked?: boolean;
}

function generateLevel(level: number): { grid: GridCell[][]; dabbas: Dabba[] } {
  const grid: GridCell[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r][c] = { type: "road", color: "#E8D5B7" };
    }
  }

  // Add some buildings as obstacles
  const buildingCount = Math.min(5 + level * 2, 20);
  for (let i = 0; i < buildingCount; i++) {
    const r = randInt(1, GRID_ROWS - 2);
    const c = randInt(1, GRID_COLS - 2);
    grid[r][c] = { type: "building", color: "#8B7355" };
  }

  // Create dabbas
  const dabbaCount = Math.min(2 + Math.floor(level / 2), 5);
  const dabbas: Dabba[] = [];

  for (let i = 0; i < dabbaCount; i++) {
    let sx: number, sy: number, ex: number, ey: number;
    // Find valid start and end positions
    do {
      sx = randInt(0, 3);
      sy = randInt(0, GRID_ROWS - 1);
    } while (grid[sy][sx].type !== "road" || dabbas.some(d => d.startX === sx && d.startY === sy));

    do {
      ex = randInt(GRID_COLS - 4, GRID_COLS - 1);
      ey = randInt(0, GRID_ROWS - 1);
    } while (grid[ey][ex].type !== "road" || dabbas.some(d => d.endX === ex && d.endY === ey));

    grid[sy][sx] = { type: "start", color: DABBA_COLORS[i], dabbaId: i };
    grid[ey][ex] = { type: "end", color: DABBA_COLORS[i], dabbaId: i };

    dabbas.push({
      id: i, startX: sx, startY: sy, endX: ex, endY: ey,
      color: DABBA_COLORS[i], emoji: DABBA_EMOJIS[i],
      path: [], delivered: false, currentPathIdx: 0,
      animX: GRID_X + sx * CELL_W + CELL_W / 2,
      animY: GRID_Y + sy * CELL_H + CELL_H / 2,
    });
  }

  return { grid, dabbas };
}

/* Simple BFS pathfinding */
function findPath(grid: GridCell[][], sx: number, sy: number, ex: number, ey: number): { x: number; y: number }[] {
  const visited: boolean[][] = [];
  const parent: (null | { x: number; y: number })[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    visited[r] = new Array(GRID_COLS).fill(false);
    parent[r] = new Array(GRID_COLS).fill(null);
  }

  const queue: { x: number; y: number }[] = [{ x: sx, y: sy }];
  visited[sy][sx] = true;
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    if (x === ex && y === ey) break;

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS && !visited[ny][nx] && grid[ny][nx].type !== "building") {
        visited[ny][nx] = true;
        parent[ny][nx] = { x, y };
        queue.push({ x: nx, y: ny });
      }
    }
  }

  // Trace back
  const path: { x: number; y: number }[] = [];
  let cur: { x: number; y: number } | null = { x: ex, y: ey };
  while (cur && !(cur.x === sx && cur.y === sy)) {
    path.unshift(cur);
    cur = parent[cur.y][cur.x];
  }
  if (cur) path.unshift({ x: sx, y: sy });
  return path;
}

/* ═══════════════════════════════════════
   Dabba Dash — Canvas Game
   ═══════════════════════════════════════ */
export default function DabbaDashGame({ onGameOver, inputBlocked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    state: "ready" as GameState,
    score: 0,
    level: 1,
    grid: [] as GridCell[][],
    dabbas: [] as Dabba[],
    particles: [] as Particle[],
    timer: 60,
    selectedDabba: -1,
    drawingPath: false,
    currentPath: [] as { x: number; y: number }[],
    t: 0,
    delivering: false,
    deliverySpeed: 0.03,
    totalDelivered: 0,
    efficiency: 100,
  });
  const [uiState, setUiState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const animRef = useRef<number>(0);

  const addParticles = useCallback((x: number, y: number, color: string, count: number, text?: string) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      s.particles.push({
        x, y, vx: rand(-3, 3), vy: rand(-4, -1),
        life: 1, color, size: rand(2, 5), text: i === 0 ? text : undefined,
      });
    }
  }, []);

  const initLevel = useCallback((level: number) => {
    const s = stateRef.current;
    const { grid, dabbas } = generateLevel(level);
    s.grid = grid;
    s.dabbas = dabbas;
    s.timer = Math.max(30, 60 - (level - 1) * 5);
    s.selectedDabba = -1;
    s.drawingPath = false;
    s.currentPath = [];
    s.delivering = false;

    // Auto-find paths for dabbas
    dabbas.forEach(d => {
      d.path = findPath(grid, d.startX, d.startY, d.endX, d.endY);
      d.delivered = false;
      d.currentPathIdx = 0;
      d.animX = GRID_X + d.startX * CELL_W + CELL_W / 2;
      d.animY = GRID_Y + d.startY * CELL_H + CELL_H / 2;
    });
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.state = "playing";
    s.score = 0; s.level = 1;
    s.particles = []; s.totalDelivered = 0; s.efficiency = 100;
    initLevel(1);
    setUiState("playing");
    setScore(0);
  }, [initLevel]);

  const startDeliveries = useCallback(() => {
    const s = stateRef.current;
    s.delivering = true;
    s.dabbas.forEach(d => {
      d.currentPathIdx = 0;
      if (d.path.length > 0) {
        d.animX = GRID_X + d.path[0].x * CELL_W + CELL_W / 2;
        d.animY = GRID_Y + d.path[0].y * CELL_H + CELL_H / 2;
      }
    });
  }, []);

  // Click handling for grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (cx: number, cy: number) => {
      const s = stateRef.current;
      if (s.state === "ready" || s.state === "gameover") { startGame(); return; }
      if (s.state === "levelComplete") {
        s.level++;
        initLevel(s.level);
        s.state = "playing";
        setUiState("playing");
        return;
      }
      if (s.delivering) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = cx * scaleX;
      const my = cy * scaleY;

      // Check "Go" button
      if (mx >= W / 2 - 50 && mx <= W / 2 + 50 && my >= H - 45 && my <= H - 10) {
        startDeliveries();
        return;
      }

      // Check grid click
      const gx = Math.floor((mx - GRID_X) / CELL_W);
      const gy = Math.floor((my - GRID_Y) / CELL_H);
      if (gx >= 0 && gx < GRID_COLS && gy >= 0 && gy < GRID_ROWS) {
        const cell = s.grid[gy][gx];
        // Select dabba
        if (cell.type === "start" && cell.dabbaId !== undefined) {
          s.selectedDabba = cell.dabbaId;
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      handleClick(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      handleClick(t.clientX - rect.left, t.clientY - rect.top);
    };

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouch);
    };
  }, [startGame, startDeliveries, initLevel]);

  // Keyboard
  useEffect(() => {
    if (inputBlocked) return;
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if ((e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        if (s.state === "ready" || s.state === "gameover") startGame();
        else if (s.state === "levelComplete") {
          s.level++; initLevel(s.level); s.state = "playing"; setUiState("playing");
        }
        else if (s.state === "playing" && !s.delivering) startDeliveries();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inputBlocked, startGame, startDeliveries, initLevel]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const loop = () => {
      const s = stateRef.current;
      s.t += 0.016;

      // Update
      if (s.state === "playing") {
        s.timer -= 0.016;

        if (s.delivering) {
          let allDone = true;
          s.dabbas.forEach(d => {
            if (d.delivered || d.path.length === 0) return;
            allDone = false;

            d.currentPathIdx += s.deliverySpeed * (1 + s.level * 0.1);
            if (d.currentPathIdx >= d.path.length - 1) {
              d.delivered = true;
              d.currentPathIdx = d.path.length - 1;
              const pts = Math.floor(100 + (s.timer / 60) * 50);
              s.score += pts;
              s.totalDelivered++;
              const tx = GRID_X + d.endX * CELL_W + CELL_W / 2;
              const ty = GRID_Y + d.endY * CELL_H + CELL_H / 2;
              addParticles(tx, ty, d.color, 15, `+${pts}`);
            } else {
              const idx = Math.floor(d.currentPathIdx);
              const frac = d.currentPathIdx - idx;
              const p1 = d.path[idx];
              const p2 = d.path[Math.min(idx + 1, d.path.length - 1)];
              d.animX = GRID_X + (p1.x + (p2.x - p1.x) * frac) * CELL_W + CELL_W / 2;
              d.animY = GRID_Y + (p1.y + (p2.y - p1.y) * frac) * CELL_H + CELL_H / 2;
            }
          });

          if (allDone || s.dabbas.every(d => d.delivered)) {
            // Level complete
            s.state = "levelComplete";
            setUiState("levelComplete");
            setScore(s.score);
          }
        }

        if (s.timer <= 0) {
          s.state = "gameover";
          setUiState("gameover");
          setScore(s.score);
          onGameOver?.(s.score);
        }

        // Particles
        s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.02; });
        s.particles = s.particles.filter(p => p.life > 0);

        setScore(s.score);
      }

      // ─── Draw ───
      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#1a1a2e");
      bgGrad.addColorStop(1, "#16213e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Title
      if (s.state === "playing" || s.state === "levelComplete") {
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 16px 'Baloo 2', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`📦 Level ${s.level}`, 20, 30);

        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Score: ${s.score}`, W - 20, 30);

        // Timer
        ctx.fillStyle = s.timer > 15 ? "#4CAF50" : "#F44336";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`⏱ ${Math.ceil(s.timer)}s`, W / 2, 30);

        // Delivery count
        ctx.fillStyle = "#90EE90";
        ctx.font = "12px sans-serif";
        ctx.fillText(`Delivered: ${s.totalDelivered}`, W / 2, 50);

        // Grid
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            const cell = s.grid[r][c];
            const cx = GRID_X + c * CELL_W;
            const cy = GRID_Y + r * CELL_H;

            if (cell.type === "building") {
              ctx.fillStyle = "#4a3728";
              ctx.beginPath(); ctx.roundRect(cx + 2, cy + 2, CELL_W - 4, CELL_H - 4, 4); ctx.fill();
              ctx.fillStyle = "#6B5B4F";
              ctx.beginPath(); ctx.roundRect(cx + 3, cy + 3, CELL_W - 6, CELL_H - 6, 3); ctx.fill();
              // Windows
              ctx.fillStyle = "rgba(255,200,100,0.5)";
              ctx.fillRect(cx + 10, cy + 10, 8, 8);
              ctx.fillRect(cx + 28, cy + 10, 8, 8);
              ctx.fillRect(cx + 10, cy + 28, 8, 8);
              ctx.fillRect(cx + 28, cy + 28, 8, 8);
            } else if (cell.type === "start") {
              ctx.fillStyle = cell.color + "33";
              ctx.beginPath(); ctx.roundRect(cx + 1, cy + 1, CELL_W - 2, CELL_H - 2, 6); ctx.fill();
              ctx.strokeStyle = cell.color;
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.font = "20px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("🏠", cx + CELL_W / 2, cy + CELL_H / 2 + 7);
            } else if (cell.type === "end") {
              ctx.fillStyle = cell.color + "33";
              ctx.beginPath(); ctx.roundRect(cx + 1, cy + 1, CELL_W - 2, CELL_H - 2, 6); ctx.fill();
              ctx.strokeStyle = cell.color;
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 4]);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.font = "20px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("🏢", cx + CELL_W / 2, cy + CELL_H / 2 + 7);
            } else {
              ctx.fillStyle = "rgba(255,255,255,0.03)";
              ctx.fillRect(cx, cy, CELL_W, CELL_H);
              ctx.strokeStyle = "rgba(255,255,255,0.06)";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(cx, cy, CELL_W, CELL_H);
            }
          }
        }

        // Draw paths
        s.dabbas.forEach(d => {
          if (d.path.length < 2) return;
          ctx.strokeStyle = d.color + "88";
          ctx.lineWidth = 4;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          d.path.forEach((p, i) => {
            const px = GRID_X + p.x * CELL_W + CELL_W / 2;
            const py = GRID_Y + p.y * CELL_H + CELL_H / 2;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Draw dabbas
        s.dabbas.forEach(d => {
          if (d.delivered) return;
          const bob = Math.sin(s.t * 3 + d.id) * 3;
          ctx.font = "22px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(d.emoji, d.animX, d.animY + bob + 7);

          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(d.animX, d.animY + 18, 12, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        // "Go" button
        if (!s.delivering) {
          const pulse = 1 + Math.sin(s.t * 4) * 0.05;
          ctx.save();
          ctx.translate(W / 2, H - 27);
          ctx.scale(pulse, pulse);
          ctx.fillStyle = "#4CAF50";
          ctx.beginPath(); ctx.roundRect(-50, -18, 100, 36, 18); ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 16px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🚀 Deliver!", 0, 1);
          ctx.restore();
        }
      }

      // Particles
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        if (p.text) {
          ctx.fillStyle = p.color;
          ctx.font = "bold 16px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // Level complete overlay
      if (s.state === "levelComplete") {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 32px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`✅ Level ${s.level} Complete!`, W / 2, H / 2 - 30);
        ctx.fillStyle = "#fff";
        ctx.font = "18px sans-serif";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 10);
        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("[ Click / Space for Next Level ]", W / 2, H / 2 + 50);
      }

      // Ready screen
      if (s.state === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📦 Dabba Dash", W / 2, H / 2 - 50);
        ctx.fillStyle = "#DEB887";
        ctx.font = "16px sans-serif";
        ctx.fillText("Route tiffins across Mumbai • Beat the clock!", W / 2, H / 2 - 10);
        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("[ Click / Tap / Space to Start ]", W / 2, H / 2 + 35);
        ctx.font = "50px sans-serif";
        ctx.fillText("📦", W / 2, H / 2 + 110);
      }

      // Game over
      if (s.state === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#F44336";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⏰ Time's Up!", W / 2, H / 2 - 50);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 - 5);
        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Levels: ${s.level}  |  Delivered: ${s.totalDelivered}`, W / 2, H / 2 + 30);
        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("[ Click / Tap / Space to Retry ]", W / 2, H / 2 + 70);
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
