import type { Lesson } from "@/types/lesson";

export const lessonPlatformer03: Lesson = {
  id: "platformer-03-ground-collision-v0",
  title: "Ground Collision v0",
  description: "Player falls through the floor. Clamp y at the ground.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["collision detection", "clamping", "AABB basics"],
  part1: {
    title: "Concept: Ground Collision v0",
    type: "concept",
    instructions: `# Ground Collision v0\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Ground Collision v0",
    type: "game_builder",
    instructions: `# Game Builder: Ground Collision v0\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
