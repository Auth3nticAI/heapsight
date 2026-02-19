import type { Lesson } from "@/types/lesson";

export const lessonRobot23: Lesson = {
  id: "robot-23-raii",
  title: "RAII",
  description: "Manual delete is fragile. Tie resource lifetime to scope with RAII.",
  order: 23,
  xpReward: 75,
  tier: "pro",
  concepts: ["RAII", "destructors", "resource lifetime"],
  part1: {
    title: "Concept: RAII",
    type: "concept",
    instructions: `# RAII\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: RAII",
    type: "robot_builder",
    instructions: `# Robot Builder: RAII\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
