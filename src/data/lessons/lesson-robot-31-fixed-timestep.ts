import type { Lesson } from "@/types/lesson";

export const lessonRobot31: Lesson = {
  id: "robot-31-fixed-timestep",
  title: "Fixed Timestep",
  description: "Sim speed varies with frame rate. Show the bug then fix with fixed dt.",
  order: 31,
  xpReward: 75,
  tier: "pro",
  concepts: ["fixed timestep", "dt", "sim loop", "determinism"],
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
    title: "Robot Builder: Fixed Timestep",
    type: "robot_builder",
    instructions: `# Robot Builder: Fixed Timestep\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
