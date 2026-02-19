import type { Lesson } from "@/types/lesson";

export const lessonPlatformer42: Lesson = {
  id: "platformer-42-slopes",
  title: "Slopes",
  description: "Only flat surfaces. Add slope tiles and adjust collision resolution.",
  order: 42,
  xpReward: 75,
  tier: "pro",
  concepts: ["slopes", "angled collision", "normal vectors"],
  part1: {
    title: "Concept: Slopes",
    type: "concept",
    instructions: `# Slopes\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Slopes",
    type: "game_builder",
    instructions: `# Game Builder: Slopes\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
