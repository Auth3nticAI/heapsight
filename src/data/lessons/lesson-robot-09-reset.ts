import type { Lesson } from "@/types/lesson";

export const lessonRobot09: Lesson = {
  id: "robot-09-reset",
  title: "Reset",
  description: "No way to restart. Add a reset() that returns robot to its start pose.",
  order: 9,
  xpReward: 75,
  tier: "pro",
  concepts: ["reset", "initialization", "state reset"],
  part1: {
    title: "Concept: Reset",
    type: "concept",
    instructions: `# Reset\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Reset",
    type: "robot_builder",
    instructions: `# Robot Builder: Reset\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
