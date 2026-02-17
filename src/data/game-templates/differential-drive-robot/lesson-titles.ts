/** Robot-specific lesson titles and descriptions for dashboard display */
export const ROBOT_LESSON_TITLES: Record<string, { title: string; description: string }> = {
  "01-hello-world": {
    title: "Boot the System",
    description: "Initialize the robot at origin and output boot diagnostics.",
  },
  "02-variables": {
    title: "Robot Telemetry",
    description: "Declare position, heading, and battery variables for robot state.",
  },
  "03-functions": {
    title: "Low Battery Reflex",
    description: "Use if/else conditionals for reactive battery behavior.",
  },
  "04-structs": {
    title: "Radar Sweep",
    description: "Loop through 8 sensor angles to scan the environment.",
  },
  "05-pointers": {
    title: "Modular Movement",
    description: "Write moveForward and turnLeft functions for an L-shaped path.",
  },
  "06-arrays": {
    title: "Sensor Array",
    description: "Store 8 sensor readings in a vector and find the closest obstacle.",
  },
  "07-loops": {
    title: "Efficient Path Passing",
    description: "Use pointers and references to efficiently update robot state.",
  },
  "08-conditionals": {
    title: "Dynamic Waypoint Manager",
    description: "Manage waypoints with unique_ptr and navigate using smart pointers.",
  },
  "09-references": {
    title: "Multi-File Architecture",
    description: "Organize code with forward declarations and separate implementations.",
  },
  "10-dynamic-memory": {
    title: "Robot Class",
    description: "Define a Robot class with private state and public movement methods.",
  },
  "11-strings": {
    title: "Telemetry Publisher",
    description: "Simulate ROS 2 publishing with periodic telemetry output.",
  },
  "12-input": {
    title: "Sensor Callback",
    description: "Process sensor data through callback functions with distance thresholds.",
  },
  "13-enums": {
    title: "RobotStats Structure",
    description: "Define enums and structs for multi-field robot mode tracking.",
  },
  "14-headers": {
    title: "Runtime Configuration",
    description: "Load and apply config parameters that drive robot behavior.",
  },
  "15-collision": {
    title: "Multi-Robot System",
    description: "Coordinate two robots publishing state and computing distance.",
  },
  "16-game-loop": {
    title: "Repair Service",
    description: "Implement request-response patterns for simulated ROS 2 services.",
  },
  "17-entity-management": {
    title: "Navigate with Feedback",
    description: "Move toward a goal with 25/50/75/100% progress milestones.",
  },
  "18-score-system": {
    title: "Composition Architecture",
    description: "Build a robot with SensorSuite composition and PID controller inheritance.",
  },
  "19-difficulty": {
    title: "Concurrent Sensor Processing",
    description: "Route lidar, camera, and IMU data through separate processors.",
  },
  "20-effects": {
    title: "Target Database",
    description: "Use std::map and std::sort to manage and prioritize targets.",
  },
  "21-save-load": {
    title: "PID Follower",
    description: "Implement a PID controller for smooth position tracking.",
  },
  "22-memory-leaks": {
    title: "Environment Mapper",
    description: "Simulate SLAM by discovering cells in an occupancy grid.",
  },
  "23-smart-pointers": {
    title: "A* Pathfinding",
    description: "Implement A* search on a 5x5 grid to navigate around obstacles.",
  },
  "24-debugging": {
    title: "State Machine",
    description: "Build an FSM with PATROL, CHASE, and RETREAT states.",
  },
  "25-final-polish": {
    title: "Autonomous Mission",
    description: "Full integration: map environment, pathfind to targets, complete mission.",
  },
};
