import { useRef, useEffect, useCallback, useState } from "react";
import { sfxKnock, sfxPowerUp, sfxHit, sfxGameOver, sfxStart, sfxLevelComplete } from "@/lib/sounds";

interface Props {
  onGameOver: (score: number) => void;
  inputBlocked: boolean;
}

interface Marble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: string;
  active: boolean;
  knockedOut: boolean;
  sparkle: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: "multishot" | "bigshooter" | "magnet";
  emoji: string;
  collected: boolean;
  pulse: number;
}

type GamePhase = "aiming" | "power" | "shooting" | "settling" | "roundEnd" | "gameOver";

const COLORS = [
  { fill: "#22c55e", glow: "#4ade80" },
  { fill: "#3b82f6", glow: "#60a5fa" },
  { fill: "#ef4444", glow: "#f87171" },
  { fill: "#f59e0b", glow: "#fbbf24" },
  { fill: "#8b5cf6", glow: "#a78bfa" },
  { fill: "#ec4899", glow: "#f472b6" },
  { fill: "#06b6d4", glow: "#22d3ee" },
  { fill: "#f97316", glow: "#fb923c" },
];

const SHOOTER_COLOR = { fill: "#fcd34d", glow: "#fde68a" };
const FRICTION = 0.985;
const MIN_SPEED = 0.15;
const CIRCLE_RADIUS = 100;
const TOTAL_ROUNDS = 5;
const MARBLES_PER_ROUND = [5, 7, 9, 10, 12];
const CANVAS_W = 700;
const CANVAS_H = 520;

const KanchaMastersGame = ({ onGameOver, inputBlocked }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    phase: "aiming" as GamePhase,
    shooter: { x: CANVAS_W / 2, y: CANVAS_H - 80, vx: 0, vy: 0, radius: 10 } as Marble & { radius: number },
    marbles: [] as Marble[],
    powerUps: [] as PowerUp[],
    aimAngle: 0,
    power: 0,
    powerDir: 1,
    score: 0,
    round: 1,
    knockedThisRound: 0,
    combo: 0,
    comboText: "",
    comboTimer: 0,
    circleX: CANVAS_W / 2,
    circleY: CANVAS_H / 2 - 30,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    shooterOrigX: CANVAS_W / 2,
    shooterOrigY: CANVAS_H - 80,
    activePowerUp: null as string | null,
    powerUpTimer: 0,
    shotsTaken: 0,
    maxShots: 0,
    tick: 0,
    settleTimer: 0,
    mouseX: CANVAS_W / 2,
    mouseY: 0,
  });

  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("aiming");
  const [combo, setCombo] = useState(0);

  const initRound = useCallback((roundNum: number) => {
    const s = stateRef.current;
    const numMarbles = MARBLES_PER_ROUND[Math.min(roundNum - 1, MARBLES_PER_ROUND.length - 1)];
    s.marbles = [];
    s.powerUps = [];

    // Place marbles in circle
    for (let i = 0; i < numMarbles; i++) {
      const angle = (Math.PI * 2 * i) / numMarbles + (Math.random() - 0.5) * 0.3;
      const dist = Math.random() * (CIRCLE_RADIUS * 0.7);
      const c = COLORS[i % COLORS.length];
      s.marbles.push({
        x: s.circleX + Math.cos(angle) * dist,
        y: s.circleY + Math.sin(angle) * dist,
        vx: 0, vy: 0,
        radius: 8,
        color: c.fill,
        glow: c.glow,
        active: true,
        knockedOut: false,
        sparkle: 0,
      });
    }

    // Power-ups outside circle
    if (roundNum >= 2) {
      const types: Array<{ type: PowerUp["type"]; emoji: string }> = [
        { type: "multishot", emoji: "🎯" },
        { type: "bigshooter", emoji: "🔴" },
        { type: "magnet", emoji: "🧲" },
      ];
      const pu = types[Math.floor(Math.random() * types.length)];
      s.powerUps.push({
        x: s.circleX + (Math.random() - 0.5) * 250,
        y: s.circleY + (Math.random() - 0.5) * 150,
        type: pu.type,
        emoji: pu.emoji,
        collected: false,
        pulse: 0,
      });
    }

    // Reset shooter
    s.shooter.x = s.shooterOrigX;
    s.shooter.y = s.shooterOrigY;
    s.shooter.vx = 0;
    s.shooter.vy = 0;
    s.shooter.radius = 10;
    s.shooter.color = SHOOTER_COLOR.fill;
    s.shooter.glow = SHOOTER_COLOR.glow;
    s.shooter.active = true;
    s.shooter.knockedOut = false;
    s.shooter.sparkle = 0;

    s.phase = "aiming";
    s.power = 0;
    s.powerDir = 1;
    s.knockedThisRound = 0;
    s.combo = 0;
    s.activePowerUp = null;
    s.powerUpTimer = 0;
    s.shotsTaken = 0;
    s.maxShots = Math.max(3, Math.ceil(numMarbles * 0.6));
    s.settleTimer = 0;
    s.particles = [];

    setPhase("aiming");
    setRound(roundNum);
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "power") return;

    const speed = 4 + (s.power / 100) * 12;
    const angle = s.aimAngle;
    s.shooter.vx = Math.cos(angle) * speed;
    s.shooter.vy = Math.sin(angle) * speed;
    s.phase = "shooting";
    s.shotsTaken++;
    setPhase("shooting");
    sfxHit();
  }, []);

  const handleClick = useCallback(() => {
    if (inputBlocked) return;
    const s = stateRef.current;

    if (s.phase === "aiming") {
      s.phase = "power";
      s.power = 0;
      s.powerDir = 1;
      setPhase("power");
    } else if (s.phase === "power") {
      shoot();
    } else if (s.phase === "roundEnd") {
      if (s.round < TOTAL_ROUNDS) {
        initRound(s.round + 1);
      } else {
        s.phase = "gameOver";
        setPhase("gameOver");
        onGameOver(s.score);
        sfxGameOver();
      }
    } else if (s.phase === "gameOver") {
      stateRef.current.score = 0;
      stateRef.current.round = 1;
      setScore(0);
      initRound(1);
    }
  }, [inputBlocked, shoot, initRound, onGameOver]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    stateRef.current.mouseX = (e.clientX - rect.left) * scaleX;
    stateRef.current.mouseY = (e.clientY - rect.top) * scaleY;
  }, []);

  // Game loop
  useEffect(() => {
    initRound(1);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const loop = () => {
      const s = stateRef.current;
      s.tick++;

      // === UPDATE ===
      // Aim angle
      if (s.phase === "aiming") {
        const dx = s.mouseX - s.shooter.x;
        const dy = s.mouseY - s.shooter.y;
        s.aimAngle = Math.atan2(dy, dx);
      }

      // Power meter
      if (s.phase === "power") {
        s.power += s.powerDir * 0.8;
        if (s.power >= 100) { s.power = 100; s.powerDir = -1; }
        if (s.power <= 0) { s.power = 0; s.powerDir = 1; }
      }

      // Shooting physics
      if (s.phase === "shooting" || s.phase === "settling") {
        // Move shooter
        s.shooter.x += s.shooter.vx;
        s.shooter.y += s.shooter.vy;
        s.shooter.vx *= FRICTION;
        s.shooter.vy *= FRICTION;

        // Magnet effect
        if (s.activePowerUp === "magnet") {
          s.marbles.forEach(m => {
            if (!m.active) return;
            const dx = m.x - s.shooter.x;
            const dy = m.y - s.shooter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 && dist > 0) {
              s.shooter.vx += (dx / dist) * 0.3;
              s.shooter.vy += (dy / dist) * 0.3;
            }
          });
        }

        // Move marbles
        s.marbles.forEach(m => {
          if (!m.active) return;
          m.x += m.vx;
          m.y += m.vy;
          m.vx *= FRICTION;
          m.vy *= FRICTION;
        });

        // Collision: shooter vs marbles
        s.marbles.forEach(m => {
          if (!m.active) return;
          const dx = m.x - s.shooter.x;
          const dy = m.y - s.shooter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = s.shooter.radius + m.radius;
          if (dist < minDist && dist > 0) {
            // Elastic collision
            const nx = dx / dist;
            const ny = dy / dist;
            const dvx = s.shooter.vx - m.vx;
            const dvy = s.shooter.vy - m.vy;
            const dvn = dvx * nx + dvy * ny;
            if (dvn > 0) {
              const shooterMass = s.activePowerUp === "bigshooter" ? 3 : 1.5;
              const marbleMass = 1;
              const totalMass = shooterMass + marbleMass;
              s.shooter.vx -= (2 * marbleMass / totalMass) * dvn * nx;
              s.shooter.vy -= (2 * marbleMass / totalMass) * dvn * ny;
              m.vx += (2 * shooterMass / totalMass) * dvn * nx;
              m.vy += (2 * shooterMass / totalMass) * dvn * ny;

              // Separate
              const overlap = minDist - dist;
              m.x += nx * overlap * 0.6;
              m.y += ny * overlap * 0.6;
              s.shooter.x -= nx * overlap * 0.4;
              s.shooter.y -= ny * overlap * 0.4;

              spawnParticles(m.x, m.y, m.glow, 6);
            }
          }
        });

        // Marble vs marble
        for (let i = 0; i < s.marbles.length; i++) {
          for (let j = i + 1; j < s.marbles.length; j++) {
            const a = s.marbles[i];
            const b = s.marbles[j];
            if (!a.active || !b.active) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = a.radius + b.radius;
            if (dist < minDist && dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;
              const dvx = a.vx - b.vx;
              const dvy = a.vy - b.vy;
              const dvn = dvx * nx + dvy * ny;
              if (dvn > 0) {
                a.vx -= dvn * nx;
                a.vy -= dvn * ny;
                b.vx += dvn * nx;
                b.vy += dvn * ny;
                const overlap = minDist - dist;
                a.x -= nx * overlap * 0.5;
                a.y -= ny * overlap * 0.5;
                b.x += nx * overlap * 0.5;
                b.y += ny * overlap * 0.5;
              }
            }
          }
        }

        // Wall bouncing
        const bounce = (obj: { x: number; y: number; vx: number; vy: number; radius: number }) => {
          if (obj.x - obj.radius < 0) { obj.x = obj.radius; obj.vx *= -0.6; }
          if (obj.x + obj.radius > CANVAS_W) { obj.x = CANVAS_W - obj.radius; obj.vx *= -0.6; }
          if (obj.y - obj.radius < 0) { obj.y = obj.radius; obj.vy *= -0.6; }
          if (obj.y + obj.radius > CANVAS_H) { obj.y = CANVAS_H - obj.radius; obj.vy *= -0.6; }
        };
        bounce(s.shooter);
        s.marbles.forEach(m => { if (m.active) bounce(m); });

        // Check knocked out (outside circle)
        s.marbles.forEach(m => {
          if (!m.active || m.knockedOut) return;
          const dx = m.x - s.circleX;
          const dy = m.y - s.circleY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > CIRCLE_RADIUS + m.radius) {
            m.knockedOut = true;
            m.sparkle = 30;
            s.knockedThisRound++;
            s.combo++;
            const points = 10 * s.combo;
            s.score += points;
            setScore(s.score);
            setCombo(s.combo);
            s.comboText = s.combo > 1 ? `${s.combo}x COMBO! +${points}` : `+${points}`;
            s.comboTimer = 60;
            spawnParticles(m.x, m.y, m.glow, 12);
          }
        });

        // Power-up collection
        s.powerUps.forEach(pu => {
          if (pu.collected) return;
          const dx = s.shooter.x - pu.x;
          const dy = s.shooter.y - pu.y;
          if (Math.sqrt(dx * dx + dy * dy) < s.shooter.radius + 15) {
            pu.collected = true;
            s.activePowerUp = pu.type;
            s.powerUpTimer = 300;
            if (pu.type === "bigshooter") s.shooter.radius = 15;
            spawnParticles(pu.x, pu.y, "#fbbf24", 10);
          }
        });

        // Power-up timer
        if (s.activePowerUp) {
          s.powerUpTimer--;
          if (s.powerUpTimer <= 0) {
            s.activePowerUp = null;
            s.shooter.radius = 10;
          }
        }

        // Check if all stopped
        const allStopped = (Math.abs(s.shooter.vx) < MIN_SPEED && Math.abs(s.shooter.vy) < MIN_SPEED) &&
          s.marbles.every(m => !m.active || (Math.abs(m.vx) < MIN_SPEED && Math.abs(m.vy) < MIN_SPEED));

        if (s.phase === "shooting" && allStopped) {
          s.shooter.vx = 0; s.shooter.vy = 0;
          s.marbles.forEach(m => { m.vx = 0; m.vy = 0; });

          // Deactivate knocked out marbles
          s.marbles.forEach(m => { if (m.knockedOut) m.active = false; });

          const allKnocked = s.marbles.every(m => !m.active);
          const outOfShots = s.shotsTaken >= s.maxShots;

          if (allKnocked || outOfShots) {
            s.phase = "roundEnd";
            setPhase("roundEnd");
          } else {
            // Reset shooter for next shot
            s.combo = 0;
            setCombo(0);
            s.shooter.x = s.shooterOrigX;
            s.shooter.y = s.shooterOrigY;
            s.shooter.vx = 0;
            s.shooter.vy = 0;
            if (s.activePowerUp !== "bigshooter") s.shooter.radius = 10;
            s.phase = "aiming";
            setPhase("aiming");
          }
        }
      }

      // Particles
      s.particles = s.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life--;
        return p.life > 0;
      });

      if (s.comboTimer > 0) s.comboTimer--;

      // Sparkle countdown
      s.marbles.forEach(m => { if (m.sparkle > 0) m.sparkle--; });

      // === DRAW ===
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Dusty ground background
      const groundGrad = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, 50, CANVAS_W / 2, CANVAS_H / 2, 400);
      groundGrad.addColorStop(0, "#d4a574");
      groundGrad.addColorStop(0.5, "#c49a6c");
      groundGrad.addColorStop(1, "#a67c52");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground texture (small dots)
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      for (let i = 0; i < 200; i++) {
        const gx = (i * 137.5) % CANVAS_W;
        const gy = (i * 97.3) % CANVAS_H;
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Circle (chalk line)
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(s.circleX, s.circleY, CIRCLE_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Inner glow
      const circleGlow = ctx.createRadialGradient(s.circleX, s.circleY, CIRCLE_RADIUS * 0.8, s.circleX, s.circleY, CIRCLE_RADIUS);
      circleGlow.addColorStop(0, "rgba(255,255,255,0)");
      circleGlow.addColorStop(1, "rgba(255,255,255,0.06)");
      ctx.fillStyle = circleGlow;
      ctx.beginPath();
      ctx.arc(s.circleX, s.circleY, CIRCLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Power-ups
      s.powerUps.forEach(pu => {
        if (pu.collected) return;
        pu.pulse += 0.05;
        const scale = 1 + Math.sin(pu.pulse) * 0.15;
        ctx.save();
        ctx.translate(pu.x, pu.y);
        ctx.scale(scale, scale);
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pu.emoji, 0, 0);
        ctx.restore();
      });

      // Draw marble helper
      const drawMarble = (m: Marble, isShooter = false) => {
        if (!m.active && !isShooter) return;
        const r = m.radius || 8;

        ctx.save();
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(m.x + 2, m.y + 3, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        if (isShooter || m.sparkle > 0) {
          ctx.shadowColor = m.glow || m.color;
          ctx.shadowBlur = isShooter ? 15 : m.sparkle;
        }

        // Main sphere
        const grad = ctx.createRadialGradient(m.x - r * 0.3, m.y - r * 0.3, r * 0.1, m.x, m.y, r);
        grad.addColorStop(0, m.glow || "#fff");
        grad.addColorStop(0.4, m.color);
        grad.addColorStop(1, darken(m.color, 0.4));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(m.x - r * 0.25, m.y - r * 0.25, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      // Draw marbles
      s.marbles.forEach(m => drawMarble(m));
      // Knocked-out marbles (faded)
      s.marbles.forEach(m => {
        if (m.knockedOut && !m.active) {
          ctx.globalAlpha = 0.3;
          drawMarble({ ...m, active: true });
          ctx.globalAlpha = 1;
        }
      });

      // Draw shooter
      drawMarble(s.shooter as any, true);

      // Aim line
      if (s.phase === "aiming") {
        const len = 80;
        const ex = s.shooter.x + Math.cos(s.aimAngle) * len;
        const ey = s.shooter.y + Math.sin(s.aimAngle) * len;
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(s.shooter.x, s.shooter.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - Math.cos(s.aimAngle - 0.3) * 10,
          ey - Math.sin(s.aimAngle - 0.3) * 10
        );
        ctx.lineTo(
          ex - Math.cos(s.aimAngle + 0.3) * 10,
          ey - Math.sin(s.aimAngle + 0.3) * 10
        );
        ctx.fill();
        ctx.restore();
      }

      // Power meter
      if (s.phase === "power") {
        const meterW = 160;
        const meterH = 14;
        const mx = CANVAS_W / 2 - meterW / 2;
        const my = CANVAS_H - 35;

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.roundRect(mx - 2, my - 2, meterW + 4, meterH + 4, 8);
        ctx.fill();

        const powerGrad = ctx.createLinearGradient(mx, my, mx + meterW, my);
        powerGrad.addColorStop(0, "#22c55e");
        powerGrad.addColorStop(0.5, "#eab308");
        powerGrad.addColorStop(1, "#ef4444");
        ctx.fillStyle = powerGrad;
        ctx.beginPath();
        ctx.roundRect(mx, my, meterW * (s.power / 100), meterH, 6);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⚡ POWER — Tap to shoot!", CANVAS_W / 2, my - 8);
      }

      // Particles
      s.particles.forEach(p => {
        ctx.globalAlpha = p.life / 50;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / 50), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Combo text
      if (s.comboTimer > 0 && s.comboText) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, s.comboTimer / 20);
        ctx.fillStyle = "#fbbf24";
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 3;
        ctx.font = `bold ${20 + (60 - s.comboTimer) * 0.2}px sans-serif`;
        ctx.textAlign = "center";
        ctx.strokeText(s.comboText, CANVAS_W / 2, s.circleY - CIRCLE_RADIUS - 20 - (60 - s.comboTimer) * 0.5);
        ctx.fillText(s.comboText, CANVAS_W / 2, s.circleY - CIRCLE_RADIUS - 20 - (60 - s.comboTimer) * 0.5);
        ctx.restore();
      }

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.roundRect(10, 10, 180, 70, 10);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`🏆 Score: ${s.score}`, 22, 32);
      ctx.fillText(`🔵 Round: ${s.round}/${TOTAL_ROUNDS}`, 22, 52);
      ctx.fillText(`🎯 Shots: ${s.maxShots - s.shotsTaken} left`, 22, 72);

      // Active power-up indicator
      if (s.activePowerUp) {
        ctx.fillStyle = "rgba(251,191,36,0.3)";
        ctx.beginPath();
        ctx.roundRect(CANVAS_W - 110, 10, 100, 30, 8);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`⚡ ${s.activePowerUp.toUpperCase()}`, CANVAS_W - 60, 30);
      }

      // Phase hints
      if (s.phase === "aiming") {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎯 Aim with mouse — Click to set power", CANVAS_W / 2, CANVAS_H - 12);
      }

      // Round end screen
      if (s.phase === "roundEnd") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.round < TOTAL_ROUNDS ? `Round ${s.round} Complete!` : "🏆 Game Over!", CANVAS_W / 2, CANVAS_H / 2 - 40);

        ctx.fillStyle = "#fff";
        ctx.font = "18px sans-serif";
        ctx.fillText(`Marbles knocked: ${s.knockedThisRound}/${s.marbles.length}`, CANVAS_W / 2, CANVAS_H / 2);
        ctx.fillText(`Total Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 30);

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "14px sans-serif";
        ctx.fillText(s.round < TOTAL_ROUNDS ? "Click to start next round →" : "Click to play again", CANVAS_W / 2, CANVAS_H / 2 + 70);
      }

      // Game over
      if (s.phase === "gameOver") {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🏆 Kancha Master! 🏆", CANVAS_W / 2, CANVAS_H / 2 - 30);

        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif";
        ctx.fillText(`Final Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);

        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "14px sans-serif";
        ctx.fillText("Click to play again", CANVAS_W / 2, CANVAS_H / 2 + 50);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [initRound, spawnParticles]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-background">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        className="w-full max-w-[700px] rounded-xl cursor-crosshair"
        style={{ imageRendering: "auto", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
      />
      {/* Bottom HUD */}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span>🏆 {score}</span>
        <span>🔵 Round {round}/{TOTAL_ROUNDS}</span>
        {combo > 1 && <span className="text-accent font-bold">{combo}x Combo!</span>}
        <span className="capitalize">{phase === "aiming" ? "🎯 Aim" : phase === "power" ? "⚡ Power" : phase === "shooting" ? "💨 Rolling..." : phase === "roundEnd" ? "✅ Round Done" : phase === "gameOver" ? "🏁 Game Over" : ""}</span>
      </div>
    </div>
  );
};

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (num & 0xff) * (1 - amount));
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export default KanchaMastersGame;
