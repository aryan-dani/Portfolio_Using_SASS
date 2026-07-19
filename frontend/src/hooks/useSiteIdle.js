import { useSiteIdleState } from "../context/SiteIdleContext";

/**
 * Back-compat helper - maps a threshold to the nearest idle tier.
 * Prefer useSiteIdleState() for chrome / stale behavior.
 */
export function useSiteIdle(thresholdMs = 12000) {
  const { isResting, hideChrome, isStale } = useSiteIdleState();

  if (thresholdMs >= 30000) return isStale;
  if (thresholdMs >= 2000 && thresholdMs < 9000) return hideChrome;
  if (thresholdMs >= 11000) return hideChrome;
  return isResting;
}
