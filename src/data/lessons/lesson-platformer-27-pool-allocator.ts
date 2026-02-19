import type { Lesson } from "@/types/lesson";

export const lessonPlatformer27: Lesson = {
  id: "platformer-27-pool-allocator",
  title: "Pool Allocator",
  description: "Frequent heap allocation stalls the loop. Pre-allocate a fixed pool.",
  order: 27,
  xpReward: 75,
  tier: "pro",
  concepts: ["pool allocator", "memory pools", "allocation performance"],
  part1: {
    title: "Concept: Pool Allocator",
    type: "concept",
    instructions: `# Pool Allocator\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Pool Allocator",
    type: "game_builder",
    instructions: `# Game Builder: Pool Allocator\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
