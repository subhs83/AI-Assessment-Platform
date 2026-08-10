export default function SvgText({
  x,
  y,
  children,
  fontSize = 16,
  textAnchor = "middle",
  fontWeight = "400",
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      textAnchor={textAnchor}
      fontWeight={fontWeight}
      dominantBaseline="middle"
    >
      {children}
    </text>
  );
}