import type { Lesson } from "@/types/lesson";

export const lessonPlatformer71: Lesson = {
  id: "platformer-71-background-loading",
  title: "Background Loading Thread",
  description: "Level loading stalls the game. Simulate async loading in a background thread.",
  order: 71,
  xpReward: 75,
  tier: "pro",
  concepts: ["threading", "async loading", "std::thread"],
  part1: {
    title: "Concept: Background Loading Thread",
    type: "concept",
    instructions: `# Background Loading Thread\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Background Loading Thread",
    type: "game_builder",
    instructions: `# Game Builder: Background Loading Thread\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
