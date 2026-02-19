import type { Lesson } from "@/types/lesson";

export const lessonRobot44: Lesson = {
  id: "robot-44-imu",
  title: "IMU Sensor",
  description: "Heading is perfect. Add gyro drift to simulate an IMU.",
  order: 44,
  xpReward: 75,
  tier: "pro",
  concepts: ["IMU", "gyro drift", "heading error"],
  part1: {
    title: "Concept: IMU Sensor",
    type: "concept",
    instructions: `# IMU Sensor\n\nTODO: Add concept instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Robot Builder: IMU Sensor",
    type: "robot_builder",
    instructions: `# Robot Builder: IMU Sensor\n\nTODO: Add instructions.`,
    starterCode: `// TODO: Add starter code`,
    solutionCode: `// TODO: Add solution code`,
    tests: [
      { id: "g1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false },
    ],
    hints: ["TODO: Add hints"],
    estimatedMinutes: 15,
  },
};
