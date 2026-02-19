import type { Lesson } from "@/types/lesson";

export const lessonPlatformer25: Lesson = {
  id: "platformer-25-raii-fix",
  title: "RAII Fix",
  description: "Manual delete is fragile. Use RAII resource tied to scope.",
  order: 25,
  xpReward: 75,
  tier: "pro",
  concepts: ["RAII", "destructors", "scope-based cleanup", "resource management"],
  part1: {
    title: "Concept: RAII Fix",
    type: "concept",
    instructions: `# RAII Fix\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: RAII Fix",
    type: "game_builder",
    instructions: `# Game Builder: RAII Fix\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
