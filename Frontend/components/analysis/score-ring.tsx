"use client";

import * as React from "react";

interface ScoreRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({
  score,
  size = 56,
  strokeWidth = 5,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return "#EF4444"; // high risk red
    if (s >= 40) return "#F59E0B"; // medium risk amber
    return "#10B981"; // low risk green
  };

  const strokeColor = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-sans font-bold text-sm text-(--foreground)">
        {score}
      </span>
    </div>
  );
}

