import type { Lesson } from "@/types/lesson";

export const lessonRobot22: Lesson = {
  id: "robot-22-manual-delete",
  title: "Manual Delete",
  description: "Leak persists. Fix with manual delete and understand ownership rules.",
  order: 22,
  xpReward: 75,
  tier: "pro",
  concepts: ["delete", "ownership", "manual memory"],
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
    title: "Robot Builder: Manual Delete",
    type: "robot_builder",
    instructions: `# Robot Builder: Manual Delete\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
