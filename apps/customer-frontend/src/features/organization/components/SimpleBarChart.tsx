// src/features/organization/components/SimpleBarChart.tsx
// ✅ Simple Bar Chart Component - No external library needed

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

export function SimpleBarChart({
  data,
  height = 200,
  showValues = true,
  formatValue = (v) => String(v),
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const defaultColors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-indigo-500",
  ];

  return (
    <div className="w-full">
      <div
        className="flex items-end justify-around gap-2"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const color =
            item.color || defaultColors[index % defaultColors.length];

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 max-w-20"
            >
              {/* Value label */}
              {showValues && (
                <span className="text-xs font-medium text-gray-600 mb-1">
                  {formatValue(item.value)}
                </span>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${color}`}
                style={{
                  height: `${Math.max(barHeight, 2)}%`,
                  minHeight: "4px",
                }}
              />

              {/* Label */}
              <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ✅ Simple Donut Chart
interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface SimpleDonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function SimpleDonutChart({
  data,
  size = 160,
  strokeWidth = 24,
  centerLabel,
  centerValue,
}: SimpleDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />

        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = total > 0 ? item.value / total : 0;
          const dashLength = percentage * circumference;
          const offset = currentOffset;
          currentOffset += dashLength;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-offset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {/* Center text */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue !== undefined && (
            <span className="text-2xl font-bold text-gray-900">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-xs text-gray-500">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ✅ Simple Progress Bar
interface SimpleProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
  height?: number;
}

export function SimpleProgressBar({
  value,
  max = 100,
  color = "bg-orange-500",
  showLabel = true,
  label,
  height = 8,
}: SimpleProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className="w-full bg-gray-100 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ✅ Simple Stat Card with Trend
interface StatTrendProps {
  label: string;
  value: string | number;
  trend?: number; // percentage change
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatTrend({
  label,
  value,
  trend,
  trendLabel,
  icon,
  color = "text-orange-600",
}: StatTrendProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`text-sm font-medium ${
              isPositive
                ? "text-green-600"
                : isNegative
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {isPositive ? "↑" : isNegative ? "↓" : "→"}{" "}
            {Math.abs(trend).toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-gray-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default SimpleBarChart;
