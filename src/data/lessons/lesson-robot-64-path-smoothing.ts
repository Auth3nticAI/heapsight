import type { Lesson } from "@/types/lesson";

export const lessonRobot64: Lesson = {
  id: "robot-64-path-smoothing",
  title: "Path Smoothing",
  description: "Path is jagged. Apply a smoothing pass to reduce unnecessary waypoints.",
  order: 64,
  xpReward: 75,
  tier: "pro",
  concepts: ["path smoothing", "waypoint reduction", "spline"],
  part1: {
    title: "Concept: Path Smoothing",
    type: "concept",
    instructions: `# Path Smoothing\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: Path Smoothing",
    type: "robot_builder",
    instructions: `# Robot Builder: Path Smoothing\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
