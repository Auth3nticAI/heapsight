import type { Lesson } from "@/types/lesson";

export const lessonPlatformer08: Lesson = {
  id: "platformer-08-player-state-machine",
  title: "Player State Machine",
  description: "Jump logic is messy. Introduce an enum FSM for grounded vs airborne.",
  order: 8,
  xpReward: 75,
  tier: "pro",
  concepts: ["FSM", "enum states", "state transitions", "grounded/airborne"],
  part1: {
    title: "Concept: Player State Machine",
    type: "concept",
    instructions: `# Player State Machine\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game Builder: Player State Machine",
    type: "game_builder",
    instructions: `# Game Builder: Player State Machine\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
