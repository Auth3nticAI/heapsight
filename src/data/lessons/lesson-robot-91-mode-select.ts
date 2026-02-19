import type { Lesson } from "@/types/lesson";

export const lessonRobot91: Lesson = {
  id: "robot-91-mode-select",
  title: "Mode Select",
  description: "Sim starts in one mode. Add a startup menu to select sim scenario.",
  order: 91,
  xpReward: 75,
  tier: "pro",
  concepts: ["mode select", "menu", "startup"],
  part1: {
    title: "Concept: Mode Select",
    type: "concept",
    instructions: `# Mode Select\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Mode Select",
    type: "robot_builder",
    instructions: `# Robot Builder: Mode Select\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
