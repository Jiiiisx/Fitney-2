"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", workouts: 1, goal: 2 },
  { name: "Tue", workouts: 2, goal: 2 },
  { name: "Wed", workouts: 1, goal: 1 },
  { name: "Thu", workouts: 3, goal: 2 },
  { name: "Fri", workouts: 2, goal: 2 },
  { name: "Sat", workouts: 1, goal: 3 },
  { name: "Sun", workouts: 0, goal: 1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="label font-bold text-gray-800">{label}</p>
        <p
          className="intro"
          style={{ color: "#1f2937" }}
        >{`Workouts : ${payload[0].value}`}</p>
        <p className="intro text-gray-500">{`Goal : ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function HistoryActivityChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Activity</h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            <Bar
              dataKey="workouts"
              fill="#1f2937"
              name="Workouts"
              radius={[10, 10, 0, 0]}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#fbbf24"
              strokeWidth={2}
              name="Goal"
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
