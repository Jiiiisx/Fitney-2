"use client";

import { useTheme } from "next-themes";
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

const PIE_COLORS_LIGHT = ["#FFBB28", "#0088FE"];
const PIE_COLORS_DARK = ["#F5B400", "#3B82F6"];

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-popover/90 backdrop-blur-sm border border-border rounded-lg shadow-lg">
        <p className="label font-bold text-popover-foreground">{`${label}`}</p>
        <p
          className="intro"
          style={{ color: payload[0].stroke }}
        >{`Calories : ${payload[0].value}`}</p>
        <p
          className="intro"
          style={{ color: payload[1].stroke }}
        >{`Time : ${payload[1].value} min`}</p>
      </div>
    );
  }
  return null;
};

export default function ProgressCharts() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const primaryChartColor = isDarkMode ? "#e2e8f0" : "#1f2937"; // slate-200 vs slate-800
  const secondaryChartColor = isDarkMode ? "#22c55e" : "#16a34a"; // green-500 vs green-600
  const pieColors = isDarkMode ? PIE_COLORS_DARK : PIE_COLORS_LIGHT;

  return (
    <div className="bg-card p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
        <button className="px-4 py-2 text-sm font-semibold text-foreground bg-muted rounded-lg hover:bg-muted/80">
          Compare Weeks
        </button>
      </div>
      <div className="flex flex-col gap-8">
        {/* Weekly Trend Area Chart (Full Width) */}
        <div className="bg-card p-4 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyTrendData}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={primaryChartColor}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={primaryChartColor}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={secondaryChartColor}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={secondaryChartColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" />
              <YAxis stroke="hsl(var(--color-muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "hsl(var(--color-foreground))" }} />
              <Area
                type="monotone"
                dataKey="calories"
                stroke={primaryChartColor}
                fillOpacity={1}
                fill="url(#colorCalories)"
              />
              <Area
                type="monotone"
                dataKey="time"
                stroke={secondaryChartColor}
                fillOpacity={1}
                fill="url(#colorTime)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row with two charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Distribution Pie Chart */}
          <div className="bg-card p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
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
                  stroke="hsl(var(--color-card))"
                >
                  {activityDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Body Part Progress Radar Chart */}
          <div className="bg-card p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              Strength Balance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={bodyPartData}
              >
                <PolarGrid className="stroke-border" />
                <PolarAngleAxis
                  dataKey="name"
                  stroke="hsl(var(--color-muted-foreground))"
                />
                <Radar
                  name="Progress"
                  dataKey="progress"
                  stroke={primaryChartColor}
                  fill={primaryChartColor}
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend wrapperStyle={{ color: "hsl(var(--color-foreground))" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
