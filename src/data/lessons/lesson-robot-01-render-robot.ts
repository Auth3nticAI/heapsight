import type { Lesson } from "@/types/lesson";

export const lessonRobot01: Lesson = {
  id: "robot-01-render-robot",
  title: "Render Robot",
  description: "Nothing renders. Print the robot starting position to the terminal.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["cout", "main()", "output protocol", "robot position"],
  part1: {
    title: "Concept: Render Robot",
    type: "concept",
    instructions: `# Render Robot\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Render Robot",
    type: "robot_builder",
    instructions: `# Robot Builder: Render Robot\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
