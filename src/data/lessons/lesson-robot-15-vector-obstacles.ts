import type { Lesson } from "@/types/lesson";

export const lessonRobot15: Lesson = {
  id: "robot-15-vector-obstacles",
  title: "Vector Obstacles",
  description: "Fixed obstacle count limits the world. Store obstacles in std::vector.",
  order: 15,
  xpReward: 75,
  tier: "pro",
  concepts: ["std::vector", "dynamic obstacles", "world model"],
  part1: {
    title: "Concept: Vector Obstacles",
    type: "concept",
    instructions: `# Vector Obstacles\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Vector Obstacles",
    type: "robot_builder",
    instructions: `# Robot Builder: Vector Obstacles\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
