import type { Lesson } from "@/types/lesson";

export const lessonRobot68: Lesson = {
  id: "robot-68-replan",
  title: "Replanning",
  description: "Path is computed once and becomes stale. Replan when blocked by new obstacles.",
  order: 68,
  xpReward: 75,
  tier: "pro",
  concepts: ["replanning", "dynamic obstacles", "online planning"],
  part1: {
    title: "Concept: Replanning",
    type: "concept",
    instructions: `# Replanning\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Replanning",
    type: "robot_builder",
    instructions: `# Robot Builder: Replanning\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
