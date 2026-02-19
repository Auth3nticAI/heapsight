import type { Lesson } from "@/types/lesson";

export const lessonRobot05: Lesson = {
  id: "robot-05-obstacle-collision",
  title: "Obstacle Collision",
  description: "Robot passes through walls. Detect and resolve collision with boundary.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: ["collision", "boundary", "clamping"],
  part1: {
    title: "Concept: Obstacle Collision",
    type: "concept",
    instructions: `# Obstacle Collision\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Obstacle Collision",
    type: "robot_builder",
    instructions: `# Robot Builder: Obstacle Collision\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
