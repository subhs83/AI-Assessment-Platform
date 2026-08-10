import {
  SvgCircle,
  SvgRect,
  SvgPolygon,
} from "../SvgShape";
import SvgText from "../SvgText";

export default function VennDiagramRenderer({ figure }) {
  const labels = figure?.labels || [];

  return (
    <>
      {/* Square */}
      <SvgRect
        x={140}
        y={80}
        width={260}
        height={240}
      />

      {/* Triangle */}
      <SvgPolygon
        points="270,55 120,315 420,315"
      />

      {/* Circle */}
      <SvgCircle
        cx={300}
        cy={200}
        r={105}
      />

      {/* Labels */}
      {labels.map((label, index) => {
        const positions = [
          { x: 190, y: 150 },
          { x: 300, y: 130 },
          { x: 360, y: 155 },
          { x: 250, y: 220 },
          { x: 350, y: 240 },
          { x: 300, y: 190 },
        ];

        const position =
          positions[index] || {
            x: 300,
            y: 200,
          };

        return (
          <SvgText
            key={`${label}-${index}`}
            x={position.x}
            y={position.y}
            fontSize={18}
          >
            {label}
          </SvgText>
        );
      })}
    </>
  );
}