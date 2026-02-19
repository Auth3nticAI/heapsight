import type { Lesson } from "@/types/lesson";

export const lessonRobot25: Lesson = {
  id: "robot-25-pool-allocator",
  title: "Pool Allocator",
  description: "Frequent sensor allocation stalls the sim. Pre-allocate a fixed pool.",
  order: 25,
  xpReward: 75,
  tier: "pro",
  concepts: ["pool allocator", "memory pools", "sim performance"],
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
    title: "Robot Builder: Pool Allocator",
    type: "robot_builder",
    instructions: `# Robot Builder: Pool Allocator\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
