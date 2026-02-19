import type { Lesson } from "@/types/lesson";

export const lessonRobot42: Lesson = {
  id: "robot-42-lidar-fan",
  title: "Lidar Fan",
  description: "Single ray is insufficient. Cast 360-degree fan of rays.",
  order: 42,
  xpReward: 75,
  tier: "pro",
  concepts: ["lidar", "ray fan", "360 scan"],
  part1: {
    title: "Concept: Lidar Fan",
    type: "concept",
    instructions: `# Lidar Fan\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Lidar Fan",
    type: "robot_builder",
    instructions: `# Robot Builder: Lidar Fan\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
