import type { Lesson } from "@/types/lesson";

export const lessonRobot93: Lesson = {
  id: "robot-93-crash-proof",
  title: "Crash Proof",
  description: "Bad input crashes the sim. Add guards for all external data entry points.",
  order: 93,
  xpReward: 75,
  tier: "pro",
  concepts: ["crash prevention", "input validation", "robustness"],
  part1: {
    title: "Concept: Crash Proof",
    type: "concept",
    instructions: `# Crash Proof\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Crash Proof",
    type: "robot_builder",
    instructions: `# Robot Builder: Crash Proof\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
