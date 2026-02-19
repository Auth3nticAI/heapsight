import type { Lesson } from "@/types/lesson";

export const lessonRobot21: Lesson = {
  id: "robot-21-sensor-buffer-leak",
  title: "Sensor Buffer Leak Demo",
  description: "Sensor buffer is never freed. Demonstrate the memory leak.",
  order: 21,
  xpReward: 75,
  tier: "pro",
  concepts: ["memory leak", "heap", "raw pointers", "leak demo"],
  part1: {
    title: "Concept: Sensor Buffer Leak Demo",
    type: "concept",
    instructions: `# Sensor Buffer Leak Demo\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Sensor Buffer Leak Demo",
    type: "robot_builder",
    instructions: `# Robot Builder: Sensor Buffer Leak Demo\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
