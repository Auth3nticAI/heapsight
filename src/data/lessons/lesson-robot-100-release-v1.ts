import type { Lesson } from "@/types/lesson";

export const lessonRobot100: Lesson = {
  id: "robot-100-release-v1",
  title: "Release v1.0",
  description: "Milestone: tag v1.0 export build artifact robotics sim complete.",
  order: 100,
  xpReward: 400,
  tier: "pro",
  concepts: ["milestone", "release", "v1.0", "complete"],
  part1: {
    title: "Concept: Release v1.0",
    type: "concept",
    instructions: `# Release v1.0\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Release v1.0",
    type: "robot_builder",
    instructions: `# Robot Builder: Release v1.0\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
