"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Line, Html } from "@react-three/drei";
import { useLessonStore } from "@/store/lesson-store";
import type { RobotFrame, RobotSensor } from "@/types/robot";

const FRAME_INTERVAL_MS = 200;
const OVERLAY_DELAY_MS = 500;

function RobotBody({
  position,
  theta,
}: {
  position: [number, number];
  theta: number;
}) {
  return (
    <group
      position={[position[0], 0.15, position[1]]}
      rotation={[0, -theta, 0]}
    >
      {/* Main chassis */}
      <mesh>
        <boxGeometry args={[0.5, 0.2, 0.3]} />
        <meshStandardMaterial color="#00ff88" />
      </mesh>
      {/* Left wheel */}
      <mesh position={[0, -0.05, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Right wheel */}
      <mesh position={[0, -0.05, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Heading indicator cone */}
      <mesh position={[0.3, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.1, 8]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>
    </group>
  );
}

function SensorRays({
  position,
  theta,
  sensors,
}: {
  position: [number, number];
  theta: number;
  sensors: RobotSensor[];
}) {
  if (sensors.length === 0) return null;

  return (
    <group>
      {sensors.map((s, i) => {
        const worldAngle = theta + (s.angle * Math.PI) / 180;
        const endX = position[0] + Math.cos(worldAngle) * s.distance;
        const endZ = position[1] + Math.sin(worldAngle) * s.distance;
        return (
          <Line
            key={i}
            points={[
              [position[0], 0.15, position[1]],
              [endX, 0.15, endZ],
            ]}
            color="#ff0040"
            lineWidth={1}
            transparent
            opacity={0.6}
          />
        );
      })}
    </group>
  );
}

function TrailPath({ trail }: { trail: { x: number; y: number }[] }) {
  if (trail.length < 2) return null;
  const points = trail.map(
    (p) => [p.x, 0.01, p.y] as [number, number, number]
  );
  return (
    <Line points={points} color="#00ff88" lineWidth={2} transparent opacity={0.4} />
  );
}

function Scene({ frame }: { frame: RobotFrame | null }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellColor="#1a1a2e"
        sectionSize={2}
        sectionColor="#2a2a3e"
        fadeDistance={15}
      />
      {frame ? (
        <>
          <RobotBody
            position={[frame.position.x, frame.position.y]}
            theta={frame.position.theta}
          />
          <SensorRays
            position={[frame.position.x, frame.position.y]}
            theta={frame.position.theta}
            sensors={frame.sensors}
          />
          <TrailPath trail={frame.trail} />
        </>
      ) : (
        <Html center>
          <p className="text-[#444] text-xs font-mono whitespace-nowrap">
            Run your code to see the robot
          </p>
        </Html>
      )}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={12}
      />
    </>
  );
}

export default function RobotPreviewCanvas() {
  const robotFrames = useLessonStore((s) => s.robotFrames);

  const [frameIndex, setFrameIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When new frames arrive, start animation from the beginning
  useEffect(() => {
    // Clear any pending timers
    if (animationRef.current) clearTimeout(animationRef.current);
    if (overlayRef.current) clearTimeout(overlayRef.current);

    if (robotFrames.length === 0) {
      setFrameIndex(-1);
      setIsAnimating(false);
      setShowOverlay(false);
      return;
    }

    setFrameIndex(0);
    setIsAnimating(true);
    setShowOverlay(false);
  }, [robotFrames]);

  // Step through frames
  useEffect(() => {
    if (!isAnimating || robotFrames.length === 0 || frameIndex < 0) return;

    if (frameIndex < robotFrames.length - 1) {
      animationRef.current = setTimeout(() => {
        setFrameIndex((prev) => prev + 1);
      }, FRAME_INTERVAL_MS);
      return () => {
        if (animationRef.current) clearTimeout(animationRef.current);
      };
    } else {
      // Animation finished — show overlay after delay if mission complete
      setIsAnimating(false);
      const lastFrame = robotFrames[robotFrames.length - 1];
      if (lastFrame.missionComplete) {
        overlayRef.current = setTimeout(() => {
          setShowOverlay(true);
        }, OVERLAY_DELAY_MS);
        return () => {
          if (overlayRef.current) clearTimeout(overlayRef.current);
        };
      }
    }
  }, [frameIndex, isAnimating, robotFrames]);

  const currentFrame = frameIndex >= 0 && frameIndex < robotFrames.length
    ? robotFrames[frameIndex]
    : null;

  const handleReplay = () => {
    if (robotFrames.length === 0) return;
    setShowOverlay(false);
    setFrameIndex(0);
    setIsAnimating(true);
  };

  const handleTogglePause = () => {
    if (robotFrames.length === 0) return;
    if (isAnimating) {
      setIsAnimating(false);
    } else if (frameIndex < robotFrames.length - 1) {
      setIsAnimating(true);
    }
  };

  return (
    <div className="h-full flex flex-col rounded-lg border border-[#1a1a2e] bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] border-b border-[#1a1a2e]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          Robot Simulation
        </span>
        {currentFrame && (
          <span className="text-[10px] font-mono text-primary">
            ({currentFrame.position.x.toFixed(1)},{" "}
            {currentFrame.position.y.toFixed(1)})
            {currentFrame.sensors.length > 0 &&
              ` | ${currentFrame.sensors.length} sensors`}
          </span>
        )}
        {robotFrames.length > 1 && (
          <span className="text-[10px] font-mono text-[#555] ml-auto">
            {frameIndex + 1}/{robotFrames.length}
          </span>
        )}
      </div>
      <div className="flex-1 relative" aria-label="3D robot simulation" role="img">
        <Canvas camera={{ position: [3, 4, 3], fov: 50 }}>
          <Scene frame={currentFrame} />
        </Canvas>

        {/* Message overlay (bottom) */}
        {currentFrame?.message && !showOverlay && (
          <div className="absolute bottom-2 left-2 right-2 bg-[#0d0d1a]/90 border border-[#1a1a2e] rounded px-2 py-1">
            <p className="text-xs font-mono text-white whitespace-pre-line">
              {currentFrame.message.trim()}
            </p>
          </div>
        )}

        {/* Animation controls */}
        {robotFrames.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-10">
            <button
              onClick={handleTogglePause}
              className="bg-[#0d0d1a]/80 border border-[#1a1a2e] px-2 py-0.5 rounded text-[10px] font-mono text-[#888] hover:text-white transition-colors"
            >
              {isAnimating ? "\u23F8" : "\u25B6"}
            </button>
            <button
              onClick={handleReplay}
              className="bg-[#0d0d1a]/80 border border-[#1a1a2e] px-2 py-0.5 rounded text-[10px] font-mono text-[#888] hover:text-white transition-colors"
            >
              {"\u21BB"}
            </button>
          </div>
        )}

        {/* Mission complete overlay — only after animation finishes */}
        {showOverlay && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <div className="text-center">
              <span className="text-primary font-bold text-xl font-mono">
                MISSION COMPLETE
              </span>
              <button
                onClick={handleReplay}
                className="block mx-auto mt-3 text-xs font-mono text-[#888] hover:text-white transition-colors"
              >
                {"\u21BB"} Replay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
