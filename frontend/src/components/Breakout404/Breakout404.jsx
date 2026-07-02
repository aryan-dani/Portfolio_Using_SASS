import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "portfolio_breakout_high";
const BRICKS = "404NOTFOUNDARYAN".split("");

function BreakoutGame({ onScore }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(() => Number(localStorage.getItem(STORAGE_KEY) || 0));
  const [gameOver, setGameOver] = useState(false);
  const onScoreRef = useRef(onScore);
  onScoreRef.current = onScore;

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    let raf = 0;
    let localScore = 0;
    setGameOver(false);
    setScore(0);

    const paddle = { w: 72, h: 10, x: W / 2 - 36, y: H - 24 };
    const ball = { x: W / 2, y: H / 2, vx: 3.2, vy: -3.2, r: 6 };
    const cols = 8;
    const brickW = (W - 20) / cols;
    const bricks = BRICKS.map((ch, i) => ({
      ch,
      x: 10 + (i % cols) * brickW,
      y: 40 + Math.floor(i / cols) * 28,
      w: brickW - 4,
      h: 22,
      alive: true,
    }));

    const draw = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-surface").trim() || "#fff";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-primary-container").trim() || "#131316";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
      bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.strokeStyle = "#131316";
        ctx.lineWidth = 2;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-accent-electric").trim() || "#131316";
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "#131316";
        ctx.font = "bold 12px monospace";
        ctx.fillText(b.ch, b.x + b.w / 2 - 4, b.y + 15);
      });

      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy *= -1;
      if (
        ball.y + ball.r >= paddle.y &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w &&
        ball.vy > 0
      ) {
        ball.vy *= -1;
        const hit = (ball.x - paddle.x) / paddle.w - 0.5;
        ball.vx = hit * 6;
      }
      if (ball.y > H) {
        setGameOver(true);
        cancelAnimationFrame(raf);
        return;
      }
      bricks.forEach((b) => {
        if (!b.alive) return;
        if (
          ball.x > b.x &&
          ball.x < b.x + b.w &&
          ball.y > b.y &&
          ball.y < b.y + b.h
        ) {
          b.alive = false;
          ball.vy *= -1;
          localScore += 10;
          setScore(localScore);
          if (localScore > high) {
            setHigh(localScore);
            localStorage.setItem(STORAGE_KEY, String(localScore));
            onScoreRef.current?.();
          }
        }
      });
      if (bricks.every((b) => !b.alive)) {
        setGameOver(true);
        cancelAnimationFrame(raf);
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      paddle.x = Math.max(0, Math.min(W - paddle.w, ((clientX - rect.left) / rect.width) * W - paddle.w / 2));
    };
    const onPointer = (e) => onMove(e.clientX);
    canvas.addEventListener("pointermove", onPointer);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onPointer);
    };
  }, [high]);

  useEffect(() => {
    return startGame();
  }, [startGame]);

  return (
    <div className="w-full max-w-lg border-4 border-outline bg-[var(--color-surface)] p-3 shadow-[8px_8px_0_var(--shadow-color)]">
      <div className="flex justify-between font-label-bold text-xs uppercase mb-2">
        <span>Score: {score}</span>
        <span>High: {high}</span>
      </div>
      <canvas ref={canvasRef} width={400} height={280} className="w-full border-4 border-outline touch-none" />
      {gameOver && (
        <p className="mt-2 font-body-md text-sm text-[var(--color-on-surface)]">
          {score >= 80 ? "Even my 404 ships features." : "Press restart or go home."}
        </p>
      )}
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={startGame} className="border-2 border-outline px-3 py-2 font-label-bold uppercase text-xs bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
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
