import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { ACHIEVEMENTS, ALL_PAGE_PATHS } from "../data/achievements";
import { useToast } from "./ToastContext";
import { useSound } from "./SoundContext";
import { subscribePortfolioScroll, getPortfolioScrollY } from "../utils/smoothScroll";

const STORAGE_KEY = "portfolio_achievements_v1";
const AchievementContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { unlocked: [], stats: {} };
    return JSON.parse(raw);
  } catch {
    return { unlocked: [], stats: {} };
  }
}

function saveState(unlocked, stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked, stats }));
}

export function AchievementProvider({ children }) {
  const { showToast } = useToast();
  const { play } = useSound();
  const location = useLocation();
  const [unlocked, setUnlocked] = useState(() => loadState().unlocked);
  const statsRef = useRef(loadState().stats);
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;

  const unlock = useCallback(
    (id, { silent = false } = {}) => {
      if (unlockedRef.current.includes(id)) return false;
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement) return false;

      const next = [...unlockedRef.current, id];
      unlockedRef.current = next;
      setUnlocked(next);
      saveState(next, statsRef.current);

      if (!silent) {
        showToast(achievement.description, "success", {
          title: `🏆 ${achievement.title}`,
          duration: 5200,
        });
        play("success");
      }

      const secrets = ACHIEVEMENTS.filter((a) => a.secret);
      const unlockedSecrets = next.filter((uid) => secrets.some((s) => s.id === uid));
      if (unlockedSecrets.length >= secrets.length && !next.includes("secret_agent")) {
        setTimeout(() => unlock("secret_agent"), 400);
      }

      return true;
    },
    [play, showToast],
  );

  const track = useCallback(
    (event, payload = {}) => {
      const stats = { ...statsRef.current };

      switch (event) {
        case "cli_command":
          stats.cliCommands = (stats.cliCommands || 0) + 1;
          if (stats.cliCommands >= 10) unlock("terminal_velocity");
          break;
        case "theme_toggle":
          unlock("night_owl");
          break;
        case "page_visit": {
          const visited = new Set(stats.pagesVisited || []);
          visited.add(payload.path);
          stats.pagesVisited = [...visited];
          if (ALL_PAGE_PATHS.every((p) => visited.has(p))) unlock("deep_diver");
          break;
        }
        case "project_modal":
          stats.projectModals = (stats.projectModals || 0) + 1;
          if (stats.projectModals >= 5) unlock("certified_stalker");
          break;
        case "scroll":
          stats.maxScroll = Math.max(stats.maxScroll || 0, payload.y || 0);
          if (stats.maxScroll >= 10000) unlock("speed_reader");
          break;
        case "konami":
          unlock("konami_kid");
          break;
        case "hack":
          unlock("hacker");
          break;
        case "matrix":
          unlock("matrix");
          break;
        case "coffee":
          unlock("tea_time");
          break;
        case "hire":
          unlock("hired");
          break;
        case "idle_wake":
          unlock("idle_wake");
          break;
        case "guestbook":
          unlock("guestbook");
          break;
        case "ai_ask":
          unlock("ai_curiosity");
          break;
        case "dev_hud":
          unlock("dev_mode");
          break;
        case "breakout_score":
          unlock("breakout");
          break;
        default:
          break;
      }

      statsRef.current = stats;
      saveState(unlockedRef.current, stats);
    },
    [unlock],
  );

  useEffect(() => {
    track("page_visit", { path: location.pathname });
  }, [location.pathname, track]);

  useEffect(() => {
    let lastY = getPortfolioScrollY();
    const onScroll = () => {
      const y = getPortfolioScrollY();
      if (y > lastY) {
        track("scroll", { y });
      }
      lastY = y;
    };
    return subscribePortfolioScroll(onScroll);
  }, [track]);

  const value = useMemo(
    () => ({
      achievements: ACHIEVEMENTS,
      unlocked,
      unlock,
      track,
      progress: unlocked.length / ACHIEVEMENTS.length,
    }),
    [unlocked, unlock, track],
  );

  return <AchievementContext.Provider value={value}>{children}</AchievementContext.Provider>;
}

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error("useAchievements must be used within AchievementProvider");
  return ctx;
}
