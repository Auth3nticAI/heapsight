import type { Lesson } from "@/types/lesson";

export const lessonRobot57: Lesson = {
  id: "robot-57-grid-update",
  title: "Grid Update Pass",
  description: "Grid cells are never freed. Add a decay pass for cells not recently hit.",
  order: 57,
  xpReward: 75,
  tier: "pro",
  concepts: ["grid decay", "occupancy update", "map maintenance"],
  part1: {
    title: "Concept: Grid Update Pass",
    type: "concept",
    instructions: `# Grid Update Pass\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Grid Update Pass",
    type: "robot_builder",
    instructions: `# Robot Builder: Grid Update Pass\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
