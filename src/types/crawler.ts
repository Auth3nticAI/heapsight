export interface CrawlerSensor {
  distance: number;
  angle: number;
}

export interface CrawlerFrame {
  position: { x: number; y: number; theta: number };
  velocity: { linear: number; angular: number };
  sensors: CrawlerSensor[];
  joints: Record<string, number>;
  trail: { x: number; y: number }[];
  message: string;
  missionComplete: boolean;
}
