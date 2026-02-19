import type { Lesson } from "@/types/lesson";

export const lessonRobot95: Lesson = {
  id: "robot-95-unit-tests-pid",
  title: "Unit Tests: PID",
  description: "PID correctness is unknown. Write unit tests for gain response.",
  order: 95,
  xpReward: 75,
  tier: "pro",
  concepts: ["unit tests", "PID", "gain response"],
  part1: {
    title: "Concept: Unit Tests: PID",
    type: "concept",
    instructions: `# Unit Tests: PID\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Unit Tests: PID",
    type: "robot_builder",
    instructions: `# Robot Builder: Unit Tests: PID\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
