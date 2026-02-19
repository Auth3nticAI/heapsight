import type { Lesson } from "@/types/lesson";

export const lessonRobot71: Lesson = {
  id: "robot-71-threaded-mapping",
  title: "Threaded Mapping",
  description: "Mapping blocks the control loop. Move it to a background thread.",
  order: 71,
  xpReward: 75,
  tier: "pro",
  concepts: ["threading", "std::thread", "async mapping"],
  part1: {
    title: "Concept: Threaded Mapping",
    type: "concept",
    instructions: `# Threaded Mapping\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Threaded Mapping",
    type: "robot_builder",
    instructions: `# Robot Builder: Threaded Mapping\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
