import type { RobotFrame } from "@/types/robot";

/**
 * Parse robot output into a single accumulated frame (legacy).
 */
export function parseRobotOutput(output: string): RobotFrame {
  const frames = parseRobotFrames(output);
  return frames.length > 0 ? frames[frames.length - 1] : {
    position: { x: 0, y: 0, theta: 0 },
    velocity: { linear: 0, angular: 0 },
    sensors: [],
    joints: {},
    trail: [],
    message: "",
    missionComplete: false,
  };
}

/**
 * Parse robot output into an array of frames — one per position update.
 * Used for step-by-step animation in the canvas.
 */
export function parseRobotFrames(output: string): RobotFrame[] {
  const lines = output.trim().split("\n");
  const frames: RobotFrame[] = [];

  let position = { x: 0, y: 0, theta: 0 };
  let velocity = { linear: 0, angular: 0 };
  const sensors: { distance: number; angle: number }[] = [];
  let joints: Record<string, number> = {};
  let trail: { x: number; y: number }[] = [];
  let message = "";
  let missionComplete = false;

  for (const line of lines) {
    if (line.startsWith("ROBOT|position|")) {
      const parts = line.substring(15).split("|");
      const x = parseFloat(parts[0]) || 0;
      const y = parseFloat(parts[1]) || 0;
      const theta = parseFloat(parts[2]) || 0;
      position = { x, y, theta };
      trail = [...trail, { x, y }];

      // Snapshot a frame for each position update
      frames.push({
        position: { ...position },
        velocity: { ...velocity },
        sensors: [...sensors],
        joints: { ...joints },
        trail: [...trail],
        message,
        missionComplete: false,
      });
    } else if (line.startsWith("ROBOT|velocity|")) {
      const parts = line.substring(15).split("|");
      velocity = {
        linear: parseFloat(parts[0]) || 0,
        angular: parseFloat(parts[1]) || 0,
      };
    } else if (line.startsWith("ROBOT|sensor|")) {
      const parts = line.substring(13).split("|");
      sensors.push({
        distance: parseFloat(parts[0]) || 0,
        angle: parseFloat(parts[1]) || 0,
      });
    } else if (line.startsWith("ROBOT|joint|")) {
      const parts = line.substring(12).split("|");
      if (parts[0]) {
        joints = { ...joints, [parts[0]]: parseFloat(parts[1]) || 0 };
      }
    } else if (line.startsWith("ROBOT_MESSAGE|")) {
      message += line.substring(14) + "\n";
      // Update the most recent frame's message
      if (frames.length > 0) {
        frames[frames.length - 1].message = message;
      }
    } else if (line.startsWith("MISSION_COMPLETE")) {
      missionComplete = true;
      // Mark the last frame
      if (frames.length > 0) {
        frames[frames.length - 1].missionComplete = true;
      }
    }
  }

  // If no position frames but we got other data, create a single frame
  if (frames.length === 0 && (message || missionComplete)) {
    frames.push({
      position,
      velocity,
      sensors,
      joints,
      trail,
      message,
      missionComplete,
    });
  }

  return frames;
}
