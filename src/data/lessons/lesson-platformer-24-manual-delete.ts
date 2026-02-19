import type { Lesson } from "@/types/lesson";

export const lessonPlatformer24: Lesson = {
  id: "platformer-24-manual-delete",
  title: "Manual Delete",
  description: "Leak persists. Fix it with manual delete and understand ownership.",
  order: 24,
  xpReward: 75,
  tier: "pro",
  concepts: ["delete", "ownership", "RAII intro", "memory management"],
  part1: {
    title: "Concept: Manual Delete",
    type: "concept",
    instructions: `# Manual Delete\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Manual Delete",
    type: "game_builder",
    instructions: `# Game Builder: Manual Delete\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
