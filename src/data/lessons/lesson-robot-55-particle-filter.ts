import type { Lesson } from "@/types/lesson";

export const lessonRobot55: Lesson = {
  id: "robot-55-particle-filter",
  title: "Particle Filter Intro",
  description: "Pose estimate is a single point. Represent uncertainty with a particle set.",
  order: 55,
  xpReward: 75,
  tier: "pro",
  concepts: ["particle filter", "probabilistic", "localization"],
  part1: {
    title: "Concept: Particle Filter Intro",
    type: "concept",
    instructions: `# Particle Filter Intro\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Particle Filter Intro",
    type: "robot_builder",
    instructions: `# Robot Builder: Particle Filter Intro\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
