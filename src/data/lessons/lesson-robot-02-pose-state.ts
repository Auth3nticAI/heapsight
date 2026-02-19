import type { Lesson } from "@/types/lesson";

export const lessonRobot02: Lesson = {
  id: "robot-02-pose-state",
  title: "Pose State",
  description: "Robot has no state. Define x y heading as a pose struct.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["struct", "pose", "state variables", "x/y/heading"],
  part1: {
    title: "Concept: Pose State",
    type: "concept",
    instructions: `# Pose State\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Pose State",
    type: "robot_builder",
    instructions: `# Robot Builder: Pose State\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
