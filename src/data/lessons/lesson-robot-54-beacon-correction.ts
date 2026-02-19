import type { Lesson } from "@/types/lesson";

export const lessonRobot54: Lesson = {
  id: "robot-54-beacon-correction",
  title: "Beacon Correction",
  description: "Odometry drifts. Use known beacon positions to correct pose estimate.",
  order: 54,
  xpReward: 75,
  tier: "pro",
  concepts: ["beacons", "pose correction", "localization"],
  part1: {
    title: "Concept: Beacon Correction",
    type: "concept",
    instructions: `# Beacon Correction\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Beacon Correction",
    type: "robot_builder",
    instructions: `# Robot Builder: Beacon Correction\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
