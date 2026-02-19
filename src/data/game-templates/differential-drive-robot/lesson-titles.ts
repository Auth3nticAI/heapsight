/** Robot-specific lesson titles and descriptions for dashboard display */
export const ROBOT_LESSON_TITLES: Record<string, { title: string; description: string }> = {
  "01-boot-the-system": {
    title: "Boot the System",
    description: "Initialize the robot at origin and output boot diagnostics.",
  },
  "02-player-stats": {
    title: "Robot Telemetry",
    description: "Declare position, heading, and battery variables for robot state.",
  },
  "03-bullet-math": {
    title: "Low Battery Reflex",
    description: "Use if/else conditionals for reactive battery behavior.",
  },
  "04-hit-or-miss": {
    title: "Radar Sweep",
    description: "Loop through 8 sensor angles to scan the environment.",
  },
  "05-damage-function": {
    title: "Modular Movement",
    description: "Write moveForward and turnLeft functions for an L-shaped path.",
  },
  "06-soa-enemies": {
    title: "Sensor Array",
    description: "Store 8 sensor readings in a vector and find the closest obstacle.",
  },
  "07-spawn-wave-loop": {
    title: "Efficient Path Passing",
    description: "Use pointers and references to efficiently update robot state.",
  },
  "08-combat-rules": {
    title: "Dynamic Waypoint Manager",
    description: "Manage waypoints with unique_ptr and navigate using smart pointers.",
  },
  "09-component-mutation": {
    title: "Multi-File Architecture",
    description: "Organize code with forward declarations and separate implementations.",
  },
  "10-entity-pool-v0": {
    title: "Robot Class",
    description: "Define a Robot class with private state and public movement methods.",
  },
  "11-component-structs": {
    title: "Component Structs",
    description: "Define Position, Velocity, and Health structs for robot subsystems.",
  },
  "12-extract-components-header": {
    title: "Extract Components Header",
    description: "Move component structs to a dedicated header file.",
  },
  "13-inheritance-trap": {
    title: "Inheritance Trap",
    description: "See why inheritance fails for robots, then fix with composition.",
  },
  "14-dynamic-arrays": {
    title: "Dynamic Sensor Arrays",
    description: "Handle variable-count sensor readings with std::vector.",
  },
  "15-multi-system-tick": {
    title: "Multi-System Tick",
    description: "Run movement, sensing, and cleanup systems each tick.",
  },
  "16-entity-manager-class": {
    title: "Robot Manager Class",
    description: "Manage multiple robots through a centralized class.",
  },
  "17-ids-and-free-list": {
    title: "IDs and Free List",
    description: "Reuse robot slots with ID-based tracking and a free list.",
  },
  "18-save-snapshot-v0": {
    title: "Save Snapshot",
    description: "Save robot fleet state to a text file.",
  },
  "19-game-states-v0": {
    title: "Operation States",
    description: "Switch between IDLE, PATROL, and MAINTENANCE modes.",
  },
  "20-spatial-buckets-v0": {
    title: "Spatial Buckets",
    description: "Bucket robots by grid region for fast neighbor lookup.",
  },
  "21-checkpoint-save-load": {
    title: "Checkpoint Save/Load",
    description: "Resume robot operations from a saved checkpoint file.",
  },
  "22-error-handling-v0": {
    title: "Error Handling",
    description: "Gracefully handle missing files and corrupted sensor data.",
  },
  "23-thread-awareness-v0": {
    title: "Thread Awareness",
    description: "Run diagnostics on a background thread while robots operate.",
  },
  "24-lambdas-for-queries": {
    title: "Lambda Queries",
    description: "Filter and sort robots using lambda expressions.",
  },
  "25-milestone-playable-loop": {
    title: "Autonomous Mission",
    description: "Full integration: manage fleet, save state, and complete mission.",
  },
};
