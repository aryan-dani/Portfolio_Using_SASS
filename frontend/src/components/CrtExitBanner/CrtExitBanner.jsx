import { memo } from "react";
import { useTheme } from "../../context/ThemeContext";

const CrtExitBanner = memo(function CrtExitBanner() {
  const { crtMode, setCrtMode } = useTheme();

  if (!crtMode) return null;

  return (
    <div className="fixed bottom-24 md:bottom-28 left-1/2 z-[110] w-[min(92vw,28rem)] -translate-x-1/2 border-4 border-[#39ff14] bg-[#050805] p-4 shadow-[8px_8px_0_#39ff14]">
      <p className="font-label-bold text-[10px] uppercase tracking-[0.2em] text-[#7fff7f]">
        CRT hack mode active
      </p>
      <button
        type="button"
        onClick={() => setCrtMode(false)}
        className="mt-2 w-full border-2 border-[#39ff14] bg-[#39ff14] px-4 py-3 font-label-bold text-xs uppercase text-[#050805] shadow-[4px_4px_0_#1a5c12] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
      >
        Exit hack mode
      </button>
      <p className="mt-2 font-mono text-[10px] uppercase text-[#7fff7f]/80">
        Or: theme toggle · CLI <code className="text-[#39ff14]">unhack</code> · Ctrl+Alt+H · Konami
      </p>
    </div>
  );
});

export default CrtExitBanner;
