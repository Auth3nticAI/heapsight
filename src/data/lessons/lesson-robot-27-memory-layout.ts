import type { Lesson } from "@/types/lesson";

export const lessonRobot27: Lesson = {
  id: "robot-27-memory-layout",
  title: "Memory Layout",
  description: "Struct padding wastes cache lines. Inspect sizeof and reorder members.",
  order: 27,
  xpReward: 75,
  tier: "pro",
  concepts: ["sizeof", "struct padding", "cache efficiency"],
  part1: {
    title: "Concept: Memory Layout",
    type: "concept",
    instructions: `# Memory Layout\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Memory Layout",
    type: "robot_builder",
    instructions: `# Robot Builder: Memory Layout\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
