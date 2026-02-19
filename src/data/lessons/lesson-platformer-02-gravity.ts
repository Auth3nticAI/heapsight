import type { Lesson } from "@/types/lesson";

export const lessonPlatformer02: Lesson = {
  id: "platformer-02-gravity",
  title: "Gravity",
  description: "Player floats. Integrate acceleration so the player falls.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["acceleration", "velocity", "integration", "fixed timestep"],
  part1: {
    title: "Concept: Gravity",
    type: "concept",
    instructions: `# Gravity\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Gravity",
    type: "game_builder",
    instructions: `# Game Builder: Gravity\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
