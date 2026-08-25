import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "portfolio_breakout_high";
const BRICKS = "404NOTFOUNDARYAN".split("");
const CANVAS_W = 480;
const CANVAS_H = 340;
const PADDLE_W = 128;
const PADDLE_H = 14;
const BALL_R = 7;
const BASE_SPEED = 220;
const MAX_SPEED = 320;

function BreakoutGame({ onScore }) {
  const canvasRef = useRef(null);
  const loopRef = useRef({ raf: 0, stop: null });
  const highRef = useRef(Number(localStorage.getItem(STORAGE_KEY) || 0));
  const onScoreRef = useRef(onScore);
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(highRef.current);
  const [gameOver, setGameOver] = useState(false);
  onScoreRef.current = onScore;

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    loopRef.current.stop?.();
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    let localScore = 0;
    let lastTs = 0;
    setGameOver(false);
    setScore(0);

    const paddle = { w: PADDLE_W, h: PADDLE_H, x: W / 2 - PADDLE_W / 2, y: H - 28 };
    const ball = {
      x: W / 2,
      y: H * 0.62,
      vx: BASE_SPEED * 0.45,
      vy: -BASE_SPEED * 0.89,
      r: BALL_R,
    };
    const cols = 8;
    const brickW = (W - 24) / cols;
    const bricks = BRICKS.map((ch, i) => ({
      ch,
      x: 12 + (i % cols) * brickW,
      y: 44 + Math.floor(i / cols) * 30,
      w: brickW - 6,
      h: 24,
      alive: true,
    }));

    const ink = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-on-surface").trim() || "#131316";
    const surface = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-surface").trim() || "#fff";
    const fill = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-primary-container").trim() || "#131316";

    const setPaddleFromClientX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W - paddle.w / 2;
      paddle.x = Math.max(8, Math.min(W - paddle.w - 8, x));
    };

    const bounceWalls = () => {
      if (ball.x < ball.r) {
        ball.x = ball.r;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x > W - ball.r) {
        ball.x = W - ball.r;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y < ball.r) {
        ball.y = ball.r;
        ball.vy = Math.abs(ball.vy);
      }
    };

    const bouncePaddle = () => {
      if (ball.vy <= 0) return;
      const nextBottom = ball.y + ball.r;
      if (nextBottom < paddle.y || ball.y - ball.r > paddle.y + paddle.h) return;
      if (ball.x < paddle.x - ball.r || ball.x > paddle.x + paddle.w + ball.r) return;

      const hit = Math.max(0, Math.min(1, (ball.x - paddle.x) / paddle.w));
      const angle = (hit - 0.5) * Math.PI * 0.62;
      const speed = Math.min(MAX_SPEED, Math.hypot(ball.vx, ball.vy) * 1.015);
      ball.vx = Math.sin(angle) * speed;
      ball.vy = -Math.abs(Math.cos(angle) * speed);
      ball.y = paddle.y - ball.r - 0.5;
    };

    const draw = (ts) => {
      const dt = lastTs ? Math.min(0.032, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      bounceWalls();
      bouncePaddle();

      if (ball.y - ball.r > H) {
        setGameOver(true);
        loopRef.current.stop?.();
        return;
      }

      bricks.forEach((b) => {
        if (!b.alive) return;
        if (
          ball.x + ball.r > b.x &&
          ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y &&
          ball.y - ball.r < b.y + b.h
        ) {
          b.alive = false;
          const overlapX = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r));
          const overlapY = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
          if (overlapX < overlapY) ball.vx *= -1;
          else ball.vy *= -1;
          localScore += 10;
          setScore(localScore);
          if (localScore > highRef.current) {
            highRef.current = localScore;
            setHigh(localScore);
            localStorage.setItem(STORAGE_KEY, String(localScore));
            onScoreRef.current?.();
          }
        }
      });

      if (bricks.every((b) => !b.alive)) {
        setGameOver(true);
        loopRef.current.stop?.();
        return;
      }

      ctx.fillStyle = surface();
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = fill();
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.strokeStyle = ink();
      ctx.lineWidth = 2;
      ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h);

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = fill();
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = surface();
        ctx.font = "700 13px Space Grotesk, monospace";
        ctx.fillText(b.ch, b.x + b.w / 2 - 5, b.y + 16);
      });

      loopRef.current.raf = requestAnimationFrame(draw);
    };

    const onPointer = (e) => setPaddleFromClientX(e.clientX);
    const onKey = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") paddle.x = Math.max(8, paddle.x - 28);
      if (e.key === "ArrowRight" || e.key === "d") paddle.x = Math.min(W - paddle.w - 8, paddle.x + 28);
    };

    window.addEventListener("pointermove", onPointer);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    loopRef.current.raf = requestAnimationFrame(draw);
    loopRef.current.stop = () => {
      cancelAnimationFrame(loopRef.current.raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      loopRef.current.stop = null;
    };
  }, []);

  useEffect(() => {
    startGame();
    return () => loopRef.current.stop?.();
  }, [startGame]);

  return (
    <div className="w-full max-w-xl mx-auto border-4 border-outline bg-[var(--color-surface)] p-3 shadow-[8px_8px_0_var(--shadow-color)]">
      <div className="flex justify-between font-label-bold text-xs uppercase mb-2">
        <span>Score: {score}</span>
        <span>High: {high}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full border-4 border-outline touch-none"
        aria-label="404 breakout game. Move the pointer or use arrow keys to control the paddle."
      />
      {gameOver && (
        <p className="mt-2 font-body-md text-sm text-[var(--color-on-surface)]">
          {score >= 80 ? "Even my 404 ships features." : "Press restart or go home."}
        </p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={startGame}
          className="border-2 border-outline px-3 py-2 font-label-bold uppercase text-xs bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
        >
          Restart
        </button>
        <Link to="/" className="border-2 border-outline px-3 py-2 font-label-bold uppercase text-xs">
          Home
        </Link>
      </div>
    </div>
  );
}

const Breakout404 = memo(function Breakout404({ onScore }) {
  return <BreakoutGame onScore={onScore} />;
});

export default Breakout404;
