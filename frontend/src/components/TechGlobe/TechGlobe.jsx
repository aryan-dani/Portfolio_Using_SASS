import { memo, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSkills } from "../../data/skills";
import { useTheme } from "../../context/ThemeContext";

const MAX_NODES = 32;
const MAX_LABELS = 5;
const BASE_ROTATION_SPEED = 0.0032;

function getCssColor(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function buildSphereNodes(skills) {
  const curated = skills
    .filter((skill) => skill.level >= 50 || skill.projectIds?.length)
    .sort((a, b) => (b.projectIds?.length || 0) - (a.projectIds?.length || 0) || b.level - a.level)
    .slice(0, MAX_NODES);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return curated.map((skill, index) => {
    const y = 1 - (index / Math.max(curated.length - 1, 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;

    return {
      id: skill.id,
      label: skill.name,
      strength: Math.min(1, 0.55 + skill.level / 150),
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    };
  });
}

function drawCenterPlate(ctx, cx, cy, size, bg, outline) {
  const half = size / 2;
  const shadow = 4;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = outline;
  ctx.fillRect(cx - half + shadow, cy - half + shadow, size, size);
  ctx.fillStyle = bg;
  ctx.fillRect(cx - half, cy - half, size, size);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cx - half, cy - half, size, size);
  ctx.restore();
}

function buildEdgePairs(nodes) {
  const pairs = [];
  for (let i = 0; i < nodes.length; i += 1) {
    let neighbors = 0;
    for (let j = 0; j < nodes.length; j += 1) {
      if (i === j) continue;
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y, nodes[i].z - nodes[j].z);
      if (d < 0.52) {
        pairs.push([i, j]);
        neighbors += 1;
        if (neighbors >= 5) break;
      }
    }
  }
  return pairs;
}

const TechGlobe = memo(function TechGlobe() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const wrapperRef = useRef(null);
  const labelRef = useRef(null);
  const pointerRef = useRef({ active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 });
  const rotationRef = useRef({ x: -0.24, y: 0, vx: BASE_ROTATION_SPEED, vy: 0 });
  const projectedRef = useRef([]);
  const hoveredNodeRef = useRef(null);
  const colorsRef = useRef(null);
  const refreshColorsRef = useRef(() => {});
  const ensureLoopRef = useRef(() => {});
  const inViewRef = useRef(true);
  const isReducedMotionRef = useRef(false);
  const { theme, accent } = useTheme();
  const navigate = useNavigate();

  const nodes = useMemo(() => buildSphereNodes(getAllSkills()), []);
  const edgePairs = useMemo(() => buildEdgePairs(nodes), [nodes]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      isReducedMotionRef.current = media.matches;
      ensureLoopRef.current();
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      if (entry.isIntersecting) ensureLoopRef.current();
    }, { threshold: 0.12 });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && inViewRef.current) ensureLoopRef.current();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    refreshColorsRef.current?.();
  }, [theme, accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return undefined;

    const ctx = canvas.getContext("2d");
    const readColors = () => ({
      bg: getCssColor("--color-surface", "#ffffff"),
      surfaceAlt: getCssColor("--color-surface-variant", "#f2f1ed"),
      ink: getCssColor("--color-on-surface", "#131316"),
      muted: getCssColor("--color-text-muted", "#65646a"),
      outline: getCssColor("--color-outline", "#131316"),
      primary: getCssColor("--color-primary-container", "#131316"),
      onPrimary: getCssColor("--color-on-primary-container", "#f8f7f4"),
    });
    colorsRef.current = readColors();

    const refreshColors = () => {
      colorsRef.current = readColors();
    };
    refreshColorsRef.current = refreshColors;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let globeRadius = 0;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width / 2;
      centerY = height / 2 - 6;
      globeRadius = Math.min(width, height) * 0.31;
    };

    const projectNode = (node) => {
      const rotation = rotationRef.current;
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);

      const x1 = node.x * cosY - node.z * sinY;
      const z1 = node.x * sinY + node.z * cosY;
      const y1 = node.y * cosX - z1 * sinX;
      const z2 = node.y * sinX + z1 * cosX;
      const depth = (z2 + 1) / 2;
      const perspective = 0.72 + depth * 0.44;

      return {
        ...node,
        sx: centerX + x1 * globeRadius * perspective,
        sy: centerY + y1 * globeRadius * perspective,
        depth,
        size: (3.2 + depth * 5.8) * node.strength,
        alpha: 0.18 + depth * 0.82,
      };
    };

    const drawLabel = (node) => {
      const colors = colorsRef.current || readColors();
      const label = node.label.toUpperCase();
      ctx.font = "700 10px Space Grotesk, Inter, sans-serif";
      const textWidth = ctx.measureText(label).width;
      const x = Math.min(node.sx + 12, width - textWidth - 28);
      const y = Math.max(84, Math.min(node.sy - 14, height - 88));
      ctx.fillStyle = colors.bg;
      ctx.strokeStyle = colors.outline;
      ctx.lineWidth = 2;
      ctx.fillRect(x - 5, y - 12, textWidth + 10, 18);
      ctx.strokeRect(x - 5, y - 12, textWidth + 10, 18);
      ctx.fillStyle = colors.ink;
      ctx.fillText(label, x, y + 1);
    };

    const shouldAnimate = () =>
      inViewRef.current && !document.hidden && (!isReducedMotionRef.current || pointerRef.current.active);

    const draw = () => {
      frameRef.current = null;
      if (!shouldAnimate()) return;

      const colors = colorsRef.current || readColors();

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);
      drawCenterPlate(ctx, centerX, centerY, globeRadius * 0.38, colors.surfaceAlt, colors.outline);

      const rotation = rotationRef.current;
      const pointer = pointerRef.current;
      if (!isReducedMotionRef.current && !pointer.active) {
        rotation.y += rotation.vx;
        rotation.x += rotation.vy;
        rotation.vx += (BASE_ROTATION_SPEED - rotation.vx) * 0.025;
        rotation.vy *= 0.94;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.strokeStyle = colors.outline;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.16;
      for (let i = -3; i <= 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(0, i * globeRadius * 0.22, globeRadius, globeRadius * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i += 1) {
        ctx.beginPath();
        ctx.ellipse(0, 0, globeRadius * 0.18, globeRadius, (Math.PI / 6) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      const projected = nodes.map(projectNode).sort((a, b) => a.depth - b.depth);
      projectedRef.current = projected;

      ctx.lineWidth = 1;
      for (const [i, j] of edgePairs) {
        const a = projected[i];
        const b = projected[j];
        if (!a || !b) continue;
        const dx = a.sx - b.sx;
        const dy = a.sy - b.sy;
        const distance = Math.hypot(dx, dy);
        if (distance > globeRadius * 0.42 || (a.depth + b.depth) / 2 < 0.38) continue;
        ctx.globalAlpha = Math.max(0, 0.28 - distance / (globeRadius * 1.55));
        ctx.strokeStyle = colors.outline;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      projected.forEach((node) => {
        const isHovered = hoveredNodeRef.current?.id === node.id;
        ctx.globalAlpha = isHovered ? 1 : node.alpha;
        ctx.fillStyle = isHovered ? colors.primary : colors.ink;
        ctx.strokeStyle = colors.outline;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, isHovered ? node.size + 3 : node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (isHovered) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = colors.onPrimary;
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, Math.max(2.5, node.size * 0.35), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      projected
        .filter((node) => node.depth > 0.72 && node.sy < height - 96 && node.sy > 70)
        .sort((a, b) => b.depth - a.depth)
        .slice(0, MAX_LABELS)
        .forEach(drawLabel);

      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.outline;
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      ctx.fillStyle = colors.primary;
      ctx.fillRect(24, 24, 112, 30);
      ctx.strokeRect(24, 24, 112, 30);
      ctx.fillStyle = colors.onPrimary;
      ctx.font = "800 11px Space Grotesk, Inter, sans-serif";
      ctx.fillText("LIVE STACK", 38, 43);

      ctx.fillStyle = colors.surfaceAlt;
      ctx.strokeStyle = colors.outline;
      ctx.font = "800 11px Space Grotesk, Inter, sans-serif";
      const hint = "DRAG + CLICK";
      const hintWidth = ctx.measureText(hint).width + 28;
      ctx.fillRect(width - hintWidth - 28, height - 62, hintWidth, 34);
      ctx.strokeRect(width - hintWidth - 28, height - 62, hintWidth, 34);
      ctx.fillStyle = colors.muted;
      ctx.fillText(hint, width - hintWidth - 14, height - 40);

      frameRef.current = requestAnimationFrame(draw);
    };

    const ensureLoop = () => {
      if (frameRef.current || !shouldAnimate()) return;
      frameRef.current = requestAnimationFrame(draw);
    };
    ensureLoopRef.current = ensureLoop;

    resize();
    refreshColors();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);
    ensureLoop();

    return () => {
      resizeObserver.disconnect();
      refreshColorsRef.current = () => {};
      ensureLoopRef.current = () => {};
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [edgePairs, nodes]);

  const setHoverLabel = (node) => {
    if (labelRef.current) {
      labelRef.current.textContent = node ? node.label : "Skills x Projects";
    }
  };

  const updateHover = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = [...projectedRef.current]
      .reverse()
      .find((node) => node.depth > 0.38 && Math.hypot(node.sx - x, node.sy - y) < Math.max(16, node.size + 10));
    const nextHover = hit || null;
    if (hoveredNodeRef.current?.id !== nextHover?.id) {
      hoveredNodeRef.current = nextHover;
      setHoverLabel(nextHover);
    }
  };

  const handlePointerDown = (event) => {
    pointerRef.current = { active: true, x: event.clientX, y: event.clientY, velocityX: 0, velocityY: 0 };
    ensureLoopRef.current();
    canvasRef.current.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    updateHover(event);
    const pointer = pointerRef.current;
    if (!pointer.active) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    rotationRef.current.y += dx * 0.006;
    rotationRef.current.x += dy * 0.004;
    rotationRef.current.x = Math.max(-0.9, Math.min(0.9, rotationRef.current.x));
    pointer.velocityX = dx * 0.0008;
    pointer.velocityY = dy * 0.0005;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };

  const handlePointerUp = () => {
    const pointer = pointerRef.current;
    pointer.active = false;
    rotationRef.current.vx = pointer.velocityX || BASE_ROTATION_SPEED;
    rotationRef.current.vy = pointer.velocityY || 0;
  };

  const handleClick = () => {
    if (hoveredNodeRef.current) {
      navigate(`/skills?skill=${encodeURIComponent(hoveredNodeRef.current.id)}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[620px] aspect-[1.24] min-h-[360px]">
      <div className="absolute -inset-3 border-4 border-outline bg-[var(--color-surface-variant)] pointer-events-none" />
      <div className="absolute -bottom-5 -left-5 h-20 w-20 border-l-8 border-b-8 border-outline pointer-events-none" />
      <canvas
        ref={canvasRef}
        width="620"
        height="500"
        className="relative block h-full w-full border-4 border-outline shadow-[12px_12px_0px_0px_var(--shadow-color)] cursor-none touch-none"
        aria-label="Interactive rotating globe of Aryan Dani's technology stack"
        role="img"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          hoveredNodeRef.current = null;
          setHoverLabel(null);
          handlePointerUp();
        }}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      />
      <div className="absolute left-7 top-7 border-4 border-outline bg-[var(--color-surface)] px-4 py-2 font-label-bold text-[10px] uppercase tracking-[0.24em] text-[var(--color-on-surface)] shadow-[4px_4px_0_var(--shadow-color)] pointer-events-none">
        Tech Globe
      </div>
      <div
        ref={labelRef}
        className="absolute right-7 top-7 max-w-[42%] truncate border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold text-[10px] uppercase tracking-[0.18em] text-[var(--color-on-surface)] shadow-[4px_4px_0_var(--shadow-color)] pointer-events-none"
      >
        Skills x Projects
      </div>
    </div>
  );
});

export default TechGlobe;
