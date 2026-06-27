import React, { memo, useEffect, useState } from "react";

const ProgressRing = ({ percentage, color = "#4f46e5" }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    let current = 0;

    const duration = 1800;
    const interval = 16;

    const increment =
      percentage / (duration / interval);

    const timer = setInterval(() => {
      current += increment;

      if (current >= percentage) {
        current = percentage;
        clearInterval(timer);
      }

      setAnimatedPercentage(current);
    }, interval);

    return () => clearInterval(timer);
  }, [percentage]);

  const radius = 80;
  const stroke = 15;

  const normalizedRadius = radius - stroke * 2;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference -
    (animatedPercentage / 100) *
      circumference;

  return (
    <svg
      height={140}
      width={140}
      className="drop-shadow-sm"
    >
      {/* Background Ring */}
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={70}
        cy={70}
      />

      {/* Progress Ring */}
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={70}
        cy={70}
        transform="rotate(-90 70 70)"
        style={{
          transition:
            "stroke-dashoffset 0.1s linear",
        }}
      />

      {/* Percentage Text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        fontSize="22"
        fontWeight="bold"
        fill="#111827"
      >
        {Math.round(animatedPercentage)}%
      </text>
    </svg>
  );
};

export default memo(ProgressRing);