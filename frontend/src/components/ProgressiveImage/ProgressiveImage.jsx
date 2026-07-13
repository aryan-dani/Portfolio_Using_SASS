import { memo, useCallback, useEffect, useState } from "react";

/**
 * Neo-brutalist image with skeleton while loading and fade-in on ready.
 * Avoids long empty surface-colored boxes during lazy network fetches.
 */
const ProgressiveImage = memo(function ProgressiveImage({
  src,
  alt,
  width,
  height,
  sizes,
  loading = "lazy",
  fetchPriority,
  decoding = "async",
  className = "",
  imgClassName = "w-full h-full object-cover",
  objectFit = "cover",
  hoverScale = false,
}) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  const handleRef = useCallback((el) => {
    if (el?.complete && el.naturalWidth > 0) {
      setStatus("loaded");
    }
  }, []);

  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";
  const loaded = status === "loaded";
  const errored = status === "error";

  return (
    <div className={`relative overflow-hidden bg-[var(--color-surface-variant)] ${className}`}>
      {!loaded && !errored && (
        <div
          className="absolute inset-0 bg-hatch animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-text-muted)] text-center">
            Image unavailable
          </span>
        </div>
      ) : (
        <img
          ref={handleRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding={decoding}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`${imgClassName} ${fitClass} pointer-events-none transition-[opacity,transform] duration-300 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          } ${hoverScale && loaded ? "group-hover:scale-105" : ""}`}
        />
      )}
    </div>
  );
});

export default ProgressiveImage;
