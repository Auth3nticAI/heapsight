import type { Lesson } from "@/types/lesson";

export const lessonRobot12: Lesson = {
  id: "robot-12-world-class",
  title: "World Class",
  description: "World state is scattered. Create a World class for the environment.",
  order: 12,
  xpReward: 75,
  tier: "pro",
  concepts: ["World class", "encapsulation", "environment model"],
  part1: {
    title: "Concept: World Class",
    type: "concept",
    instructions: `# World Class\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: World Class",
    type: "robot_builder",
    instructions: `# Robot Builder: World Class\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
