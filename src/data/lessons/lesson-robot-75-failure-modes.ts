import type { Lesson } from "@/types/lesson";

export const lessonRobot75: Lesson = {
  id: "robot-75-failure-modes",
  title: "Failure Modes",
  description: "Robot silently enters bad states. Enumerate and handle failure modes explicitly.",
  order: 75,
  xpReward: 75,
  tier: "pro",
  concepts: ["failure modes", "error states", "fault detection"],
  part1: {
    title: "Concept: Failure Modes",
    type: "concept",
    instructions: `# Failure Modes\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Failure Modes",
    type: "robot_builder",
    instructions: `# Robot Builder: Failure Modes\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
