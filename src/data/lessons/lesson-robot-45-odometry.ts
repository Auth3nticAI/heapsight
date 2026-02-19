import type { Lesson } from "@/types/lesson";

export const lessonRobot45: Lesson = {
  id: "robot-45-odometry",
  title: "Odometry",
  description: "Position is perfect. Accumulate wheel encoder error over time.",
  order: 45,
  xpReward: 75,
  tier: "pro",
  concepts: ["odometry", "encoder", "drift accumulation"],
  part1: {
    title: "Concept: Odometry",
    type: "concept",
    instructions: `# Odometry\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Odometry",
    type: "robot_builder",
    instructions: `# Robot Builder: Odometry\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
