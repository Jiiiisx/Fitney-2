"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

// --- Chart Data ---
const weeklyTrendData = [
  { name: "Mon", calories: 400, time: 60 },
  { name: "Tue", calories: 300, time: 45 },
  { name: "Wed", calories: 500, time: 75 },
  { name: "Thu", calories: 450, time: 65 },
  { name: "Fri", calories: 600, time: 80 },
  { name: "Sat", calories: 350, time: 50 },
  { name: "Sun", calories: 0, time: 0 },
];

const activityDistributionData = [
  { name: "Cardio", value: 40 },
  { name: "Strength", value: 60 },
];

const bodyPartData = [
  { name: "Chest", progress: 80, fullMark: 100 },
  { name: "Back", progress: 65, fullMark: 100 },
  { name: "Legs", progress: 90, fullMark: 100 },
  { name: "Arms", progress: 75, fullMark: 100 },
  { name: "Shoulders", progress: 70, fullMark: 100 },
];

const COLORS = ["#FFBB28", "#0088FE"];

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="label font-bold text-gray-800">{`${label}`}</p>
        <p
          className="intro"
          style={{ color: "#1f2937" }}
        >{`Calories : ${payload[0].value}`}</p>
        <p className="intro text-teal-500">{`Time : ${payload[1].value} min`}</p>
      </div>
    );
  }
  return null;
};

export default function ProgressCharts() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Your Progress</h2>
        <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Compare Weeks
        </button>
      </div>
      <div className="flex flex-col gap-8">
        {/* Weekly Trend Area Chart (Full Width) */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyTrendData}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f2937" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1f2937" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#1f2937"
                fillOpacity={1}
                fill="url(#colorCalories)"
              />
              <Area
                type="monotone"
                dataKey="time"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorTime)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row with two charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Distribution Pie Chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Activity Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(props: any) =>
                    `${props.name} ${(props.percent * 100).toFixed(0)}%`
                  }
                >
                  {activityDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Body Part Progress Radar Chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Strength Balance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={bodyPartData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <Radar
                  name="Progress"
                  dataKey="progress"
                  stroke="#1f2937"
                  fill="#1f2937"
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
