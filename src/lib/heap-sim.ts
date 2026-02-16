export type BlockState =
  | "free"
  | "allocated"
  | "freed"
  | "dangling"
  | "corrupted";

export interface HeapBlock {
  id: number;
  label: string;
  state: BlockState;
}

export interface HeapEvent {
  time: number;
  blockIndex: number;
  action: "alloc" | "free" | "access" | "corrupt";
  label: string;
}

const BLOCK_COUNT = 32;

// Pre-scripted timeline of heap events for the crash scenario
export const CRASH_TIMELINE: HeapEvent[] = [
  // T=0.0s: Initial allocations
  { time: 0.0, blockIndex: 0, action: "alloc", label: "Player" },
  { time: 0.0, blockIndex: 1, action: "alloc", label: "Enemy_0" },
  { time: 0.0, blockIndex: 2, action: "alloc", label: "Enemy_1" },
  { time: 0.0, blockIndex: 3, action: "alloc", label: "Enemy_2" },
  { time: 0.5, blockIndex: 4, action: "alloc", label: "Bullet_0" },
  { time: 1.0, blockIndex: 5, action: "alloc", label: "Bullet_1" },
  // T=1.5s: New enemy
  { time: 1.5, blockIndex: 6, action: "alloc", label: "Enemy_3" },
  { time: 2.0, blockIndex: 7, action: "alloc", label: "Bullet_2" },
  // T=2.5s: More entities
  { time: 2.5, blockIndex: 8, action: "alloc", label: "Enemy_4" },
  { time: 3.0, blockIndex: 9, action: "alloc", label: "Bullet_3" },
  { time: 3.0, blockIndex: 10, action: "alloc", label: "Particle_0" },
  // T=3.5: targetLock assigned → block 14
  { time: 3.5, blockIndex: 11, action: "alloc", label: "targetLock*" },
  { time: 3.5, blockIndex: 12, action: "alloc", label: "Enemy_5" },
  { time: 4.0, blockIndex: 13, action: "alloc", label: "Bullet_4" },
  { time: 4.0, blockIndex: 14, action: "alloc", label: "Enemy_6" },
  { time: 4.5, blockIndex: 15, action: "alloc", label: "Bullet_5" },
  { time: 5.0, blockIndex: 16, action: "alloc", label: "Enemy_7" },
  // T=5.5s: Enemy_6 killed — memory freed but targetLock still references it
  { time: 5.5, blockIndex: 14, action: "free", label: "Enemy_6 FREED" },
  // T=6.0s: Dangling pointer access → CRASH
  { time: 6.0, blockIndex: 14, action: "access", label: "USE-AFTER-FREE" },
  // Corruption spreads
  { time: 6.0, blockIndex: 15, action: "corrupt", label: "CORRUPTED" },
  { time: 6.0, blockIndex: 16, action: "corrupt", label: "CORRUPTED" },
  { time: 6.1, blockIndex: 13, action: "corrupt", label: "CORRUPTED" },
  { time: 6.1, blockIndex: 12, action: "corrupt", label: "CORRUPTED" },
];

export function createInitialBlocks(): HeapBlock[] {
  return Array.from({ length: BLOCK_COUNT }, (_, i) => ({
    id: i,
    label: `0x${(0x7fff0000 + i * 64).toString(16)}`,
    state: "free" as BlockState,
  }));
}

export function getBlocksAtTime(time: number): HeapBlock[] {
  const blocks = createInitialBlocks();

  for (const event of CRASH_TIMELINE) {
    if (event.time > time) break;

    const block = blocks[event.blockIndex];
    switch (event.action) {
      case "alloc":
        block.state = "allocated";
        block.label = event.label;
        break;
      case "free":
        block.state = "freed";
        block.label = event.label;
        break;
      case "access":
        block.state = "dangling";
        block.label = event.label;
        break;
      case "corrupt":
        block.state = "corrupted";
        block.label = event.label;
        break;
    }
  }

  return blocks;
}

export function getFixedBlocks(): HeapBlock[] {
  const blocks = createInitialBlocks();

  for (const event of CRASH_TIMELINE) {
    // In fixed mode, stop before the free/crash events
    if (event.action === "free" || event.action === "access" || event.action === "corrupt") {
      continue;
    }
    const block = blocks[event.blockIndex];
    block.state = "allocated";
    block.label = event.label;
  }

  return blocks;
}
