"use client";

interface GameStartOverlayProps {
  onStart: () => void;
  width: number;
  height: number;
}

/**
 * "Click to Play" overlay shown before loading the WASM game.
 * The click event counts as a user gesture, which unlocks
 * the browser's AudioContext so raylib audio works immediately.
 */
export default function GameStartOverlay({ onStart, width, height }: GameStartOverlayProps) {
  const handleClick = () => {
    // Create and resume an AudioContext to unlock audio for the page.
    // This must happen synchronously within the click handler.
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().catch(() => {});
      }
    } catch {
      // Audio unlock not critical — game still works without sound
    }
    onStart();
  };

  return (
    <div
      onClick={handleClick}
      style={{ width, height }}
      className="flex flex-col items-center justify-center bg-black border border-[#333] rounded-lg cursor-pointer hover:border-[#246BFD]/50 transition-colors group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
        &#9654;
      </div>
      <span className="text-sm font-mono text-[#AFBCD5]/70 group-hover:text-white transition-colors">
        Click to Play
      </span>
      <span className="text-[10px] font-mono text-[#AFBCD5]/30 mt-1">
        Enables audio &amp; keyboard input
      </span>
    </div>
  );
}
