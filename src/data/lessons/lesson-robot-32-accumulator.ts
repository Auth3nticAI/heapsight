import type { Lesson } from "@/types/lesson";

export const lessonRobot32: Lesson = {
  id: "robot-32-accumulator",
  title: "Accumulator Loop",
  description: "Fixed dt wastes or misses steps. Use an accumulator for precise stepping.",
  order: 32,
  xpReward: 75,
  tier: "pro",
  concepts: ["accumulator", "sim stepping", "frame timing"],
  part1: {
    title: "Concept: Accumulator Loop",
    type: "concept",
    instructions: `# Accumulator Loop\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Accumulator Loop",
    type: "robot_builder",
    instructions: `# Robot Builder: Accumulator Loop\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
