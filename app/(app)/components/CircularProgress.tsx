import React from "react";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
  level?: number; // Backward compatibility (optional now)
}

const CircularProgress = ({ 
  percentage, 
  size = 200, 
  strokeWidth = 10, 
  color = "text-yellow-400",
  children,
  level 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Handle color prop being a hex code or tailwind class
  const isHex = color.startsWith("#");
  const strokeColorProps = isHex ? { stroke: color } : { className: `transition-all duration-500 ease-in-out ${color}` };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            stroke="currentColor" 
            strokeWidth={strokeWidth} 
            fill="transparent" 
            className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isHex ? color : "currentColor"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={!isHex ? `transition-all duration-500 ease-in-out ${color}` : "transition-all duration-500 ease-in-out"}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {children ? children : (
            level !== undefined && (
                <>
                    <span className="text-sm text-muted-foreground">Level</span>
                    <span className="text-3xl font-bold text-foreground">{level}</span>
                </>
            )
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
