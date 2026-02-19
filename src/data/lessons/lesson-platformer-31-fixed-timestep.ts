import type { Lesson } from "@/types/lesson";

export const lessonPlatformer31: Lesson = {
  id: "platformer-31-fixed-timestep",
  title: "Fixed Timestep",
  description: "Variable dt causes non-deterministic physics. Show the bug then fix.",
  order: 31,
  xpReward: 75,
  tier: "pro",
  concepts: ["fixed timestep", "dt", "determinism", "game loop"],
  part1: {
    title: "Concept: Fixed Timestep",
    type: "concept",
    instructions: `# Fixed Timestep\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Fixed Timestep",
    type: "game_builder",
    instructions: `# Game Builder: Fixed Timestep\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
