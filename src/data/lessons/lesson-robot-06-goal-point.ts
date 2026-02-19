import type { Lesson } from "@/types/lesson";

export const lessonRobot06: Lesson = {
  id: "robot-06-goal-point",
  title: "Goal Point",
  description: "Robot has no purpose. Add a goal position and print when reached.",
  order: 6,
  xpReward: 75,
  tier: "pro",
  concepts: ["goal", "target position", "distance check"],
  part1: {
    title: "Concept: Goal Point",
    type: "concept",
    instructions: `# Goal Point\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Goal Point",
    type: "robot_builder",
    instructions: `# Robot Builder: Goal Point\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
