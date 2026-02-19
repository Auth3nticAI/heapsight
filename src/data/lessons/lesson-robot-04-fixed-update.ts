import type { Lesson } from "@/types/lesson";

export const lessonRobot04: Lesson = {
  id: "robot-04-fixed-update",
  title: "Fixed Update Function",
  description: "Update timing is uncontrolled. Introduce a fixed-dt update function.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: ["fixed timestep", "update function", "determinism"],
  part1: {
    title: "Concept: Fixed Update Function",
    type: "concept",
    instructions: `# Fixed Update Function\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Fixed Update Function",
    type: "robot_builder",
    instructions: `# Robot Builder: Fixed Update Function\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
