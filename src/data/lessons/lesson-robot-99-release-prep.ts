import type { Lesson } from "@/types/lesson";

export const lessonRobot99: Lesson = {
  id: "robot-99-release-prep",
  title: "Release Prep",
  description: "Binary is unverified. Run all tests fix failures tag the release candidate.",
  order: 99,
  xpReward: 75,
  tier: "pro",
  concepts: ["release prep", "testing", "verification"],
  part1: {
    title: "Concept: Release Prep",
    type: "concept",
    instructions: `# Release Prep\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Release Prep",
    type: "robot_builder",
    instructions: `# Robot Builder: Release Prep\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
