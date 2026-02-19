import type { Lesson } from "@/types/lesson";

export const lessonRobot65: Lesson = {
  id: "robot-65-pid-controller",
  title: "PID Controller",
  description: "Control is bang-bang. Replace with a PID controller for smooth motion.",
  order: 65,
  xpReward: 75,
  tier: "pro",
  concepts: ["PID", "proportional", "integral", "derivative"],
  part1: {
    title: "Concept: PID Controller",
    type: "concept",
    instructions: `# PID Controller\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: PID Controller",
    type: "robot_builder",
    instructions: `# Robot Builder: PID Controller\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
