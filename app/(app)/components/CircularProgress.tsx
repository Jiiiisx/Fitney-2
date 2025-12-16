const CircularProgress = ({ percentage, level } : { percentage: number; level: number }) => {
  const strokeWidth = 10;
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-700"/>
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-yellow-400 transition-all duration-500 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm text-gray-400">Level</span>
        <span className="text-5xl font-bold text-white">{level}</span>
      </div>
    </div>
  );
};

export default CircularProgress