import type { Lesson } from "@/types/lesson";

export const lessonRobot66: Lesson = {
  id: "robot-66-pid-tuning",
  title: "PID Tuning",
  description: "PID oscillates. Tune Kp/Ki/Kd gains and observe convergence.",
  order: 66,
  xpReward: 75,
  tier: "pro",
  concepts: ["PID tuning", "Kp Ki Kd", "gain tuning", "convergence"],
  part1: {
    title: "Concept: PID Tuning",
    type: "concept",
    instructions: `# PID Tuning\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: PID Tuning",
    type: "robot_builder",
    instructions: `# Robot Builder: PID Tuning\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
