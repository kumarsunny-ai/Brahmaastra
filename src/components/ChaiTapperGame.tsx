import { useEffect, useRef, useCallback, useState } from "react";
import { sfxTap, sfxCollect, sfxMiss, sfxGameOver, sfxStart, sfxLevelComplete } from "@/lib/sounds";

/* ─── Types ─── */
type GameState = "ready" | "playing" | "gameover";
type Ingredient = "chai" | "sugar" | "ginger" | "cardamom" | "milk" | "masala";

interface Order {
  id: number;
  ingredients: Ingredient[];
  timer: number;
  maxTimer: number;
  x: number;
  targetX: number;
  completed: boolean;
  failed: boolean;
  satisfaction: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number; text?: string;
}

interface SteamParticle {
  x: number; y: number; vy: number; life: number; size: number;
}

/* ─── Constants ─── */
const W = 800, H = 520;
const INGREDIENTS: Ingredient[] = ["chai", "sugar", "ginger", "cardamom", "milk", "masala"];
const INGREDIENT_INFO: Record<Ingredient, { emoji: string; color: string; label: string }> = {
  chai: { emoji: "🍵", color: "#8B4513", label: "Chai" },
  sugar: { emoji: "🍬", color: "#FFD700", label: "Sugar" },
  ginger: { emoji: "🫚", color: "#DEB887", label: "Ginger" },
  cardamom: { emoji: "🌿", color: "#228B22", label: "Elaichi" },
  milk: { emoji: "🥛", color: "#FFFFF0", label: "Milk" },
  masala: { emoji: "🌶️", color: "#FF4500", label: "Masala" },
};

function rand(a: number, b: number) { return a + Math.random() * (b - a); }
function randInt(a: number, b: number) { return Math.floor(rand(a, b + 1)); }

interface Props {
  onGameOver?: (score: number) => void;
  inputBlocked?: boolean;
}

/* ═══════════════════════════════════════
   Chai Tapper — Canvas Game
   ═══════════════════════════════════════ */
export default function ChaiTapperGame({ onGameOver, inputBlocked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    state: "ready" as GameState,
    score: 0,
    level: 1,
    orders: [] as Order[],
    currentOrder: null as Order | null,
    addedIngredients: [] as Ingredient[],
    particles: [] as Particle[],
    steam: [] as SteamParticle[],
    lives: 5,
    combo: 0,
    bestCombo: 0,
    totalServed: 0,
    spawnTimer: 3,
    t: 0,
    orderIdCounter: 0,
    shakeX: 0,
    potBubble: 0,
    difficulty: 1,
    tipTotal: 0,
    activeSlot: -1,
  });
  const [uiState, setUiState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const animRef = useRef<number>(0);
  const buttonRects = useRef<{ x: number; y: number; w: number; h: number; ingredient: Ingredient }[]>([]);

  const generateOrder = useCallback((): Order => {
    const s = stateRef.current;
    const count = Math.min(2 + Math.floor(s.difficulty / 3), 5);
    const ings: Ingredient[] = [];
    for (let i = 0; i < count; i++) {
      ings.push(INGREDIENTS[randInt(0, Math.min(s.difficulty + 2, INGREDIENTS.length - 1))]);
    }
    s.orderIdCounter++;
    return {
      id: s.orderIdCounter,
      ingredients: ings,
      timer: 12 - Math.min(s.difficulty * 0.5, 5),
      maxTimer: 12 - Math.min(s.difficulty * 0.5, 5),
      x: W + 100,
      targetX: 0,
      completed: false,
      failed: false,
      satisfaction: 100,
    };
  }, []);

  const addParticles = useCallback((x: number, y: number, color: string, count: number, text?: string) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      s.particles.push({
        x, y, vx: rand(-3, 3), vy: rand(-5, -1),
        life: 1, color, size: rand(2, 6), text: i === 0 ? text : undefined,
      });
    }
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.state = "playing";
    s.score = 0; s.level = 1; s.lives = 5;
    s.orders = []; s.currentOrder = null;
    s.addedIngredients = []; s.particles = []; s.steam = [];
    s.combo = 0; s.bestCombo = 0; s.totalServed = 0;
    s.spawnTimer = 1; s.difficulty = 1; s.tipTotal = 0;
    s.orderIdCounter = 0;
    setUiState("playing");
    setScore(0);
  }, []);

  const serveOrder = useCallback(() => {
    const s = stateRef.current;
    if (!s.currentOrder) return;

    const order = s.currentOrder;
    // Check if ingredients match
    let correct = true;
    if (s.addedIngredients.length !== order.ingredients.length) {
      correct = false;
    } else {
      for (let i = 0; i < order.ingredients.length; i++) {
        if (s.addedIngredients[i] !== order.ingredients[i]) {
          correct = false;
          break;
        }
      }
    }

    if (correct) {
      order.completed = true;
      const timeBonus = Math.floor((order.timer / order.maxTimer) * 50);
      const comboBonus = s.combo * 10;
      const points = 100 + timeBonus + comboBonus;
      s.score += points;
      s.combo++;
      s.totalServed++;
      if (s.combo > s.bestCombo) s.bestCombo = s.combo;
      s.difficulty = 1 + Math.floor(s.totalServed / 3);

      const tip = s.combo >= 3 ? 25 : 0;
      s.tipTotal += tip;
      s.score += tip;

      addParticles(400, 200, "#FFD700", 15, `+${points}${tip > 0 ? " +tip!" : ""}`);
      // Remove from queue
      s.orders = s.orders.filter(o => o.id !== order.id);
      s.currentOrder = s.orders.length > 0 ? s.orders[0] : null;
    } else {
      addParticles(400, 200, "#FF4444", 10, "Wrong!");
      s.combo = 0;
      s.shakeX = 10;
    }
    s.addedIngredients = [];
    setScore(s.score);
  }, [addParticles]);

  const addIngredient = useCallback((ingredient: Ingredient) => {
    const s = stateRef.current;
    if (s.state !== "playing" || !s.currentOrder) return;

    s.addedIngredients.push(ingredient);
    s.potBubble = 1;
    addParticles(400, 340, INGREDIENT_INFO[ingredient].color, 5);

    // Auto-serve when all ingredients added
    if (s.addedIngredients.length >= s.currentOrder.ingredients.length) {
      setTimeout(() => serveOrder(), 300);
    }
  }, [addParticles, serveOrder]);

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
      // Number keys for ingredients
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < INGREDIENTS.length && s.state === "playing") {
        e.preventDefault();
        addIngredient(INGREDIENTS[idx]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inputBlocked, startGame, addIngredient]);

  // Click/touch handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (cx: number, cy: number) => {
      const s = stateRef.current;
      if (s.state === "ready" || s.state === "gameover") { startGame(); return; }

      // Check ingredient buttons
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const x = cx * scaleX;
      const y = cy * scaleY;

      for (const btn of buttonRects.current) {
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          addIngredient(btn.ingredient);
          return;
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
  }, [startGame, addIngredient]);

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
        // Spawn orders
        s.spawnTimer -= 0.016;
        if (s.spawnTimer <= 0 && s.orders.length < 4) {
          const order = generateOrder();
          order.targetX = 100 + s.orders.length * 160;
          s.orders.push(order);
          if (!s.currentOrder) s.currentOrder = order;
          s.spawnTimer = Math.max(3, 8 - s.difficulty * 0.5);
        }

        // Update orders
        s.orders.forEach((o, i) => {
          o.targetX = 100 + i * 160;
          o.x += (o.targetX - o.x) * 0.1;
          if (!o.completed && !o.failed) {
            o.timer -= 0.016;
            o.satisfaction = (o.timer / o.maxTimer) * 100;
            if (o.timer <= 0) {
              o.failed = true;
              s.lives--;
              s.combo = 0;
              addParticles(o.x + 60, 100, "#FF4444", 10, "Timeout!");
              if (o.id === s.currentOrder?.id) {
                s.addedIngredients = [];
                s.currentOrder = null;
              }
            }
          }
        });

        // Remove failed orders
        s.orders = s.orders.filter(o => !o.failed);
        if (!s.currentOrder && s.orders.length > 0) {
          s.currentOrder = s.orders[0];
        }

        // Check game over
        if (s.lives <= 0) {
          s.state = "gameover";
          setUiState("gameover");
          setScore(s.score);
          onGameOver?.(s.score);
        }

        // Shake
        s.shakeX *= 0.85;
        s.potBubble *= 0.92;

        // Steam
        if (Math.random() < 0.3) {
          s.steam.push({
            x: 380 + rand(-20, 20), y: 300,
            vy: rand(-1.5, -0.5), life: 1, size: rand(3, 8),
          });
        }
        s.steam.forEach(p => { p.y += p.vy; p.life -= 0.015; p.x += Math.sin(s.t * 3 + p.y) * 0.3; });
        s.steam = s.steam.filter(p => p.life > 0);

        // Particles
        s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.025; });
        s.particles = s.particles.filter(p => p.life > 0);

        setScore(s.score);
      }

      // ─── Draw ───
      ctx.save();
      ctx.translate(s.shakeX * Math.sin(s.t * 30), 0);

      // Background — warm chai shop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#2C1810");
      bgGrad.addColorStop(0.3, "#3E2723");
      bgGrad.addColorStop(1, "#4E342E");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Shelf / counter
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(0, 150, W, 8);
      ctx.fillStyle = "#6D4C41";
      ctx.fillRect(0, 280, W, 8);

      // Decorative elements
      ctx.fillStyle = "rgba(255,200,100,0.05)";
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 100, 50, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warm light glow
      const glow = ctx.createRadialGradient(400, 320, 20, 400, 320, 200);
      glow.addColorStop(0, "rgba(255,150,50,0.15)");
      glow.addColorStop(1, "rgba(255,150,50,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      if (s.state === "playing") {
        // ─── Order tickets at top ───
        s.orders.forEach((order, _i) => {
          const ox = order.x;
          const isCurrent = order.id === s.currentOrder?.id;

          // Ticket bg
          ctx.fillStyle = isCurrent ? "rgba(255,200,100,0.25)" : "rgba(255,255,255,0.08)";
          ctx.beginPath();
          ctx.roundRect(ox - 5, 20, 140, 120, 8);
          ctx.fill();
          if (isCurrent) {
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Timer bar
          const timerPct = order.timer / order.maxTimer;
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath(); ctx.roundRect(ox, 22, 130, 6, 3); ctx.fill();
          ctx.fillStyle = timerPct > 0.5 ? "#4CAF50" : timerPct > 0.25 ? "#FF9800" : "#F44336";
          ctx.beginPath(); ctx.roundRect(ox, 22, 130 * timerPct, 6, 3); ctx.fill();

          // Customer emoji
          ctx.font = "24px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("👤", ox + 65, 55);

          // Ingredients
          order.ingredients.forEach((ing, j) => {
            const ix = ox + 10 + j * 26;
            const iy = 75;
            const isAdded = isCurrent && j < s.addedIngredients.length;
            const isCorrect = isAdded && s.addedIngredients[j] === ing;

            ctx.fillStyle = isAdded
              ? (isCorrect ? "rgba(76,175,80,0.4)" : "rgba(244,67,54,0.4)")
              : "rgba(255,255,255,0.1)";
            ctx.beginPath(); ctx.roundRect(ix, iy, 24, 24, 4); ctx.fill();

            ctx.font = "16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(INGREDIENT_INFO[ing].emoji, ix + 12, iy + 18);

            if (isAdded) {
              ctx.fillStyle = isCorrect ? "#4CAF50" : "#F44336";
              ctx.font = "bold 10px sans-serif";
              ctx.fillText(isCorrect ? "✓" : "✗", ix + 12, iy - 2);
            }
          });

          // Satisfaction face
          const face = order.satisfaction > 70 ? "😊" : order.satisfaction > 40 ? "😐" : "😤";
          ctx.font = "18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(face, ox + 65, 128);
        });

        // ─── Chai pot (center) ───
        const potX = 370, potY = 340;
        const potScale = 1 + s.potBubble * 0.08;
        ctx.save();
        ctx.translate(potX, potY);
        ctx.scale(potScale, potScale);

        // Pot body
        const potGrad = ctx.createLinearGradient(-40, -30, 40, 30);
        potGrad.addColorStop(0, "#8B4513");
        potGrad.addColorStop(0.5, "#A0522D");
        potGrad.addColorStop(1, "#6B3410");
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 35, 0, 0, Math.PI * 2);
        ctx.fillStyle = potGrad;
        ctx.fill();
        ctx.strokeStyle = "#5C3317";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Chai inside
        ctx.beginPath();
        ctx.ellipse(0, -8, 35, 18, 0, 0, Math.PI);
        ctx.fillStyle = "#D2691E";
        ctx.fill();

        // Added ingredients floating
        s.addedIngredients.forEach((ing, i) => {
          const angle = (i / s.addedIngredients.length) * Math.PI * 2 + s.t;
          const ix = Math.cos(angle) * 18;
          const iy = Math.sin(angle) * 8 - 10;
          ctx.font = "14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(INGREDIENT_INFO[ing].emoji, ix, iy);
        });

        ctx.restore();

        // Steam
        s.steam.forEach(p => {
          ctx.globalAlpha = p.life * 0.4;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // ─── Ingredient buttons ───
        buttonRects.current = [];
        const btnStartX = (W - INGREDIENTS.length * 110) / 2;
        INGREDIENTS.forEach((ing, i) => {
          const bx = btnStartX + i * 110;
          const by = 430;
          const bw = 100;
          const bh = 65;
          buttonRects.current.push({ x: bx, y: by, w: bw, h: bh, ingredient: ing });

          const info = INGREDIENT_INFO[ing];
          const isHover = s.activeSlot === i;

          // Button bg
          ctx.fillStyle = isHover ? "rgba(255,200,100,0.3)" : "rgba(255,255,255,0.1)";
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 10);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Emoji
          ctx.font = "26px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(info.emoji, bx + bw / 2, by + 30);

          // Label
          ctx.fillStyle = "#DEB887";
          ctx.font = "bold 10px sans-serif";
          ctx.fillText(info.label, bx + bw / 2, by + 50);

          // Key hint
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.font = "9px sans-serif";
          ctx.fillText(`[${i + 1}]`, bx + bw / 2, by + 62);
        });

        // ─── HUD ───
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath(); ctx.roundRect(W - 190, 10, 180, 55, 8); ctx.fill();
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 18px 'Baloo 2', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`Score: ${s.score}`, W - 20, 33);
        ctx.fillStyle = "#FF8C00";
        ctx.font = "13px sans-serif";
        ctx.fillText(`Combo: ${s.combo}x  |  Tips: ₹${s.tipTotal}`, W - 20, 53);

        // Lives
        ctx.textAlign = "left";
        ctx.font = "16px sans-serif";
        for (let i = 0; i < 5; i++) {
          ctx.fillText(i < s.lives ? "☕" : "💔", 15 + i * 25, 30);
        }

        // Level
        ctx.fillStyle = "#DEB887";
        ctx.font = "12px sans-serif";
        ctx.fillText(`Level ${s.difficulty}  |  Served: ${s.totalServed}`, 15, 52);
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

      // Ready screen
      if (s.state === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("☕ Chai Tapper", W / 2, H / 2 - 50);

        ctx.fillStyle = "#DEB887";
        ctx.font = "16px sans-serif";
        ctx.fillText("Match ingredients • Serve chai • Build combos!", W / 2, H / 2 - 10);

        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("[ Click / Tap / Press Space to Start ]", W / 2, H / 2 + 35);

        ctx.fillStyle = "#aaa";
        ctx.font = "13px sans-serif";
        ctx.fillText("Click ingredients or press 1-6 keys", W / 2, H / 2 + 65);

        ctx.font = "60px sans-serif";
        ctx.fillText("☕", W / 2, H / 2 + 130);
      }

      // Game over
      if (s.state === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#FF8C00";
        ctx.font = "bold 36px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("☕ Stall Closed!", W / 2, H / 2 - 60);

        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 - 15);

        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Served: ${s.totalServed}  |  Best Combo: ${s.bestCombo}x  |  Tips: ₹${s.tipTotal}`, W / 2, H / 2 + 20);

        ctx.fillStyle = "#90EE90";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("[ Click / Tap / Space to Retry ]", W / 2, H / 2 + 65);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [onGameOver, generateOrder, addParticles]);

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
