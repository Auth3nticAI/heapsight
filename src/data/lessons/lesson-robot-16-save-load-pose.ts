import type { Lesson } from "@/types/lesson";

export const lessonRobot16: Lesson = {
  id: "robot-16-save-load-pose",
  title: "Save and Load Pose",
  description: "Robot state is lost on exit. Serialize and deserialize pose to a file.",
  order: 16,
  xpReward: 75,
  tier: "pro",
  concepts: ["file I/O", "serialization", "pose save/load"],
  part1: {
    title: "Concept: Save and Load Pose",
    type: "concept",
    instructions: `# Save and Load Pose\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Save and Load Pose",
    type: "robot_builder",
    instructions: `# Robot Builder: Save and Load Pose\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
