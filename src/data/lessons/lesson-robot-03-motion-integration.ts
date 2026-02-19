import type { Lesson } from "@/types/lesson";

export const lessonRobot03: Lesson = {
  id: "robot-03-motion-integration",
  title: "Motion Integration",
  description: "Robot stays still. Integrate velocity into position each tick.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["integration", "velocity", "tick update", "motion"],
  part1: {
    title: "Concept: Motion Integration",
    type: "concept",
    instructions: `# Motion Integration\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Motion Integration",
    type: "robot_builder",
    instructions: `# Robot Builder: Motion Integration\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
