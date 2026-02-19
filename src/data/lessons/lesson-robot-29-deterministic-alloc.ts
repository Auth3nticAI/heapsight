import type { Lesson } from "@/types/lesson";

export const lessonRobot29: Lesson = {
  id: "robot-29-deterministic-alloc",
  title: "Deterministic Allocation",
  description: "Allocation order varies. Pre-allocate all sensor buffers at startup.",
  order: 29,
  xpReward: 75,
  tier: "pro",
  concepts: ["deterministic", "pre-allocation", "startup init"],
  part1: {
    title: "Concept: Deterministic Allocation",
    type: "concept",
    instructions: `# Deterministic Allocation\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Deterministic Allocation",
    type: "robot_builder",
    instructions: `# Robot Builder: Deterministic Allocation\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
