/** Shared Konami progress so Playground does not steal B/A mid-sequence. */

const WINDOW_MS = 4200;
let activeUntil = 0;

export function markKonamiProgress() {
  activeUntil = Date.now() + WINDOW_MS;
}

export function clearKonamiProgress() {
  activeUntil = 0;
}

export function isKonamiInProgress() {
  return Date.now() < activeUntil;
}
