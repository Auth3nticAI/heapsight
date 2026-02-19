import type { Lesson } from "@/types/lesson";

export const lessonRobot92: Lesson = {
  id: "robot-92-tutorial-prompts",
  title: "Tutorial Prompts",
  description: "New users are lost. Add inline tutorial prompts for each phase.",
  order: 92,
  xpReward: 75,
  tier: "pro",
  concepts: ["tutorial", "prompts", "onboarding"],
  part1: {
    title: "Concept: Tutorial Prompts",
    type: "concept",
    instructions: `# Tutorial Prompts\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Tutorial Prompts",
    type: "robot_builder",
    instructions: `# Robot Builder: Tutorial Prompts\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
