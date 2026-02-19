import type { Lesson } from "@/types/lesson";

export const lessonRobot97: Lesson = {
  id: "robot-97-readme",
  title: "README and Docs",
  description: "Project has no docs. Write README.md with usage instructions.",
  order: 97,
  xpReward: 75,
  tier: "pro",
  concepts: ["README", "documentation", "usage"],
  part1: {
    title: "Concept: README and Docs",
    type: "concept",
    instructions: `# README and Docs\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: README and Docs",
    type: "robot_builder",
    instructions: `# Robot Builder: README and Docs\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
