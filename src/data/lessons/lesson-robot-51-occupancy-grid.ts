import type { Lesson } from "@/types/lesson";

export const lessonRobot51: Lesson = {
  id: "robot-51-occupancy-grid",
  title: "Occupancy Grid",
  description: "World model is absent. Build a 2D occupancy grid from lidar hits.",
  order: 51,
  xpReward: 75,
  tier: "pro",
  concepts: ["occupancy grid", "mapping", "lidar hits"],
  part1: {
    title: "Concept: Occupancy Grid",
    type: "concept",
    instructions: `# Occupancy Grid\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Occupancy Grid",
    type: "robot_builder",
    instructions: `# Robot Builder: Occupancy Grid\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
