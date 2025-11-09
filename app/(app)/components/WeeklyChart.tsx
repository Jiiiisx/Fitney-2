// app/(app)/components/WeeklyChart.tsx
'use client';

import React from 'react';

const weeklyData = [
  { week: 'W1', value: 120 },
  { week: 'W2', value: 180 },
  { week: 'W3', value: 150 },
  { week: 'W4', value: 210 },
  { week: 'W5', value: 190 },
];

const WeeklyChart = () => {
  const maxValue = Math.max(...weeklyData.map(d => d.value), 0) * 1.1; // Add 10% buffer
  const svgWidth = 300;
  const svgHeight = 120;

  const points = weeklyData.map((data, index) => {
    const x = (index / (weeklyData.length - 1)) * svgWidth;
    const y = svgHeight - (data.value / maxValue) * svgHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-32">
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        
        {/* The line */}
        <polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        
        {/* Data points */}
        {weeklyData.map((data, index) => {
          const x = (index / (weeklyData.length - 1)) * svgWidth;
          const y = svgHeight - (data.value / maxValue) * svgHeight;
          return <circle key={index} cx={x} cy={y} r="5" fill="white" stroke="#4f46e5" strokeWidth="2" />;
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2">
        {weeklyData.map((data) => (
          <p key={data.week} className="text-xs font-bold text-gray-500">{data.week}</p>
        ))}
      </div>
    </div>
  );
};

export default WeeklyChart;