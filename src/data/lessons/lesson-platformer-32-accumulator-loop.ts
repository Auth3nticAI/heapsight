import type { Lesson } from "@/types/lesson";

export const lessonPlatformer32: Lesson = {
  id: "platformer-32-accumulator-loop",
  title: "Accumulator Loop",
  description: "Fixed dt wastes cycles or misses frames. Use an accumulator.",
  order: 32,
  xpReward: 75,
  tier: "pro",
  concepts: ["accumulator", "frame timing", "simulation step", "game loop"],
  part1: {
    title: "Concept: Accumulator Loop",
    type: "concept",
    instructions: `# Accumulator Loop\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Accumulator Loop",
    type: "game_builder",
    instructions: `# Game Builder: Accumulator Loop\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
