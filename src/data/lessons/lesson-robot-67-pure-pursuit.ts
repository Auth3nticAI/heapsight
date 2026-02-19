import type { Lesson } from "@/types/lesson";

export const lessonRobot67: Lesson = {
  id: "robot-67-pure-pursuit",
  title: "Pure Pursuit",
  description: "PID alone does not follow curves well. Add pure pursuit for path tracking.",
  order: 67,
  xpReward: 75,
  tier: "pro",
  concepts: ["pure pursuit", "lookahead", "path following"],
  part1: {
    title: "Concept: Pure Pursuit",
    type: "concept",
    instructions: `# Pure Pursuit\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Pure Pursuit",
    type: "robot_builder",
    instructions: `# Robot Builder: Pure Pursuit\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
