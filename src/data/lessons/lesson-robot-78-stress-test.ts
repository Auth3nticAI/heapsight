import type { Lesson } from "@/types/lesson";

export const lessonRobot78: Lesson = {
  id: "robot-78-stress-test",
  title: "Stress Test",
  description: "System is untested under load. Run 1000-step automated stress tests.",
  order: 78,
  xpReward: 75,
  tier: "pro",
  concepts: ["stress test", "automated testing", "robustness"],
  part1: {
    title: "Concept: Stress Test",
    type: "concept",
    instructions: `# Stress Test\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Stress Test",
    type: "robot_builder",
    instructions: `# Robot Builder: Stress Test\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
