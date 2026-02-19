import type { Lesson } from "@/types/lesson";

export const lessonPlatformer01: Lesson = {
  id: "platformer-01-boot-window",
  title: "Boot the Window",
  description: "Nothing renders. Get the game loop running and the player block visible.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["game loop", "cout", "main()", "output protocol"],
  part1: {
    title: "Concept: Boot the Window",
    type: "concept",
    instructions: `# Boot the Window\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Boot the Window",
    type: "game_builder",
    instructions: `# Game Builder: Boot the Window\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
