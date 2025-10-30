"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { WLPercentageData } from "@/lib/api";
import StatCard from "./StatCard";

interface WLPercentageDashboardProps {
  data: WLPercentageData;
}

export default function WLPercentageDashboard({ data }: WLPercentageDashboardProps) {
  const history = data.data.history.data || [];

  // Calculate statistics from history
  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const values = history.map(([, point]) => point.value);
    const currentWL = values[values.length - 1];
    const bestWL = Math.max(...values);
    const worstWL = Math.min(...values);
    const averageWL = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Find dates for best/worst
    const bestEntry = history.find(([, point]) => point.value === bestWL);
    const worstEntry = history.find(([, point]) => point.value === worstWL);
    
    // Calculate trend (comparing last 3 to first 3)
    const recentAvg = values.slice(-3).reduce((sum, val) => sum + val, 0) / Math.min(3, values.slice(-3).length);
    const earlyAvg = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / Math.min(3, values.slice(0, 3).length);
    const trend = recentAvg - earlyAvg;
    
    // Calculate consistency (standard deviation)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - averageWL, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Days above 50% win rate
    const daysAboveFifty = values.filter(v => v >= 50).length;
    const consistencyPercentage = ((1 - (standardDeviation / averageWL)) * 100);

    return {
      currentWL,
      bestWL,
      worstWL,
      averageWL,
      bestDate: bestEntry ? bestEntry[0] : null,
      worstDate: worstEntry ? worstEntry[0] : null,
      trend,
      trendPercentage: earlyAvg > 0 ? (trend / earlyAvg) * 100 : 0,
      standardDeviation,
      daysAboveFifty,
      totalDays: values.length,
      consistencyPercentage: Math.max(0, Math.min(100, consistencyPercentage)),
    };
  }, [history]);

  // Format chart data
  const chartData = useMemo(() => {
    return history.map(([date, point]) => {
      const d = new Date(date);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: date,
        value: point.value,
        displayValue: point.displayValue,
      };
    });
  }, [history]);

  // Get performance level
  const getPerformanceLevel = (wl: number) => {
    if (wl >= 80) return { level: "Dominant", color: "text-purple-400", bgColor: "bg-purple-900/20", borderColor: "border-purple-500" };
    if (wl >= 60) return { level: "Excellent", color: "text-blue-400", bgColor: "bg-blue-900/20", borderColor: "border-blue-500" };
    if (wl >= 50) return { level: "Winning", color: "text-green-400", bgColor: "bg-green-900/20", borderColor: "border-green-500" };
    if (wl >= 40) return { level: "Average", color: "text-yellow-400", bgColor: "bg-yellow-900/20", borderColor: "border-yellow-500" };
    return { level: "Struggling", color: "text-red-400", bgColor: "bg-red-900/20", borderColor: "border-red-500" };
  };

  if (!stats) {
    return (
      <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
        <p className="text-gray-300">No win/loss percentage data available</p>
      </div>
    );
  }

  const currentLevel = getPerformanceLevel(stats.currentWL);
  const avgLevel = getPerformanceLevel(stats.averageWL);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Win/Loss Percentage Dashboard</h2>
            <p className="text-gray-300 text-sm mt-1">Comprehensive win rate analysis</p>
          </div>
          <div className={`px-4 py-2 rounded-lg border ${currentLevel.bgColor} ${currentLevel.borderColor} border-2`}>
            <p className="text-xs text-gray-300 uppercase tracking-wide">Current Level</p>
            <p className={`text-xl font-bold ${currentLevel.color}`}>{currentLevel.level}</p>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Win Rate"
          value={`${stats.currentWL.toFixed(1)}%`}
          subtitle={`Latest: ${chartData[chartData.length - 1]?.date || "N/A"}`}
          trend={stats.currentWL >= 50 ? "up" : "down"}
        />
        <StatCard
          title="Best Win Rate"
          value={`${stats.bestWL.toFixed(1)}%`}
          subtitle={stats.bestDate ? new Date(stats.bestDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}
          trend="up"
        />
        <StatCard
          title="Average Win Rate"
          value={`${stats.averageWL.toFixed(1)}%`}
          subtitle={`Over ${stats.totalDays} days tracked`}
        />
        <StatCard
          title="Worst Win Rate"
          value={`${stats.worstWL.toFixed(1)}%`}
          subtitle={stats.worstDate ? new Date(stats.worstDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}
          trend="down"
        />
      </div>

      {/* Main Chart */}
      <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Win Rate Over Time</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Your Win Rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-yellow-500 border-dashed"></div>
              <span className="text-gray-300">50% Threshold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-green-500 border-dashed"></div>
              <span className="text-gray-300">Average ({stats.averageWL.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorWL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1f2937", 
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6"
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <ReferenceLine 
              y={50} 
              stroke="#eab308" 
              strokeDasharray="5 5" 
              label={{ value: "50% Win Rate", position: "insideTopRight", fill: "#eab308" }}
            />
            <ReferenceLine 
              y={stats.averageWL} 
              stroke="#10b981" 
              strokeDasharray="5 5" 
              label={{ value: `Avg: ${stats.averageWL.toFixed(1)}%`, position: "insideBottomRight", fill: "#10b981" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWL)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Performance Metrics */}
        <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/80  rounded-lg">
              <div>
                <p className="text-sm text-gray-300">Trend</p>
                <p className={`text-lg font-semibold ${stats.trend > 0 ? "text-green-400" : stats.trend < 0 ? "text-red-400" : "text-gray-300"}`}>
                  {stats.trend > 0 ? "↑ Improving" : stats.trend < 0 ? "↓ Declining" : "→ Stable"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Change</p>
                <p className={`text-lg font-semibold ${stats.trendPercentage > 0 ? "text-green-400" : "text-red-400"}`}>
                  {stats.trendPercentage > 0 ? "+" : ""}{stats.trendPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/80  rounded-lg">
              <div>
                <p className="text-sm text-gray-300">Consistency</p>
                <p className="text-lg font-semibold text-white">
                  {stats.consistencyPercentage.toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Std Dev</p>
                <p className="text-lg font-semibold text-gray-300">
                  {stats.standardDeviation.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/80  rounded-lg">
              <div>
                <p className="text-sm text-gray-300">Days Above 50% Win Rate</p>
                <p className="text-lg font-semibold text-green-400">
                  {stats.daysAboveFifty} / {stats.totalDays}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Success Rate</p>
                <p className="text-lg font-semibold text-white">
                  {((stats.daysAboveFifty / stats.totalDays) * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-800/80  rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Performance Range</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 relative">
                  <div 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                  <div 
                    className="absolute top-0 h-2 bg-white w-0.5"
                    style={{ left: `${((stats.worstWL - 0) / (100 - 0)) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 h-2 bg-green-400 w-1 rounded-full"
                    style={{ left: `${((stats.currentWL - 0) / (100 - 0)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-300 w-20 text-right">
                  {stats.worstWL.toFixed(1)}% - {stats.bestWL.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {chartData.map((entry, index) => {
            const isPositive = entry.value >= 50;
            const isBest = entry.value === stats.bestWL;
            const isWorst = entry.value === stats.worstWL;
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  isBest ? "bg-green-900/20 border-green-500" :
                  isWorst ? "bg-red-900/20 border-red-500" :
                  isPositive ? "bg-gray-800/80 border-gray-700/50" :
                  "bg-gray-800/20 border-gray-700/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-300">{entry.date}</p>
                  {isBest && <span className="text-xs text-green-400 font-semibold">BEST</span>}
                  {isWorst && <span className="text-xs text-red-400 font-semibold">WORST</span>}
                </div>
                <p className={`text-2xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {entry.value.toFixed(1)}%
                </p>
                {index > 0 && (
                  <p className={`text-xs mt-1 ${
                    entry.value > chartData[index - 1].value ? "text-green-400" :
                    entry.value < chartData[index - 1].value ? "text-red-400" :
                    "text-gray-500"
                  }`}>
                    {entry.value > chartData[index - 1].value ? "↑" : entry.value < chartData[index - 1].value ? "↓" : "→"} 
                    {" "}{Math.abs(entry.value - chartData[index - 1].value).toFixed(1)}% from previous
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

