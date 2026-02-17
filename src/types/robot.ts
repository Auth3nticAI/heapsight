export interface RobotSensor {
  distance: number;
  angle: number;
}

export interface RobotFrame {
  position: { x: number; y: number; theta: number };
  velocity: { linear: number; angular: number };
  sensors: RobotSensor[];
  joints: Record<string, number>;
  trail: { x: number; y: number }[];
  message: string;
  missionComplete: boolean;
}
