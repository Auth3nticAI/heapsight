interface PathConnectorProps {
  fromOffsetX: number;
  toOffsetX: number;
  completed: boolean;
  height?: number;
}

export default function PathConnector({
  fromOffsetX,
  toOffsetX,
  completed,
  height = 80,
}: PathConnectorProps) {
  // SVG draws a smooth curve from the center of the previous node to the center of the next.
  // We work in a coordinate system where x=0 is the center column.
  // The SVG viewBox is wide enough to handle the max swing.
  const maxSwing = 120; // must cover largest possible offset
  const svgWidth = maxSwing * 2;
  const centerX = svgWidth / 2;

  const x1 = centerX + fromOffsetX;
  const x2 = centerX + toOffsetX;

  // Control points for a gentle S-curve
  const cy1 = height * 0.35;
  const cy2 = height * 0.65;

  const d = `M ${x1} 0 C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${height}`;

  return (
    <div className="flex justify-center" style={{ height }}>
      <svg
        width={svgWidth}
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <path
          d={d}
          fill="none"
          stroke={completed ? "#22c55e" : "#1f2937"}
          strokeWidth={completed ? 3 : 2}
          strokeDasharray={completed ? "none" : "6 4"}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
