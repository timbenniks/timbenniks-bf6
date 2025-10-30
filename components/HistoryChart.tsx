'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HistoryDataPoint {
  date: string;
  value: number;
  displayValue: string;
}

type HistoryData = Array<[string, {
  metadata: Record<string, unknown>;
  value: number;
  displayValue: string;
  displayType: string;
}]>;

interface HistoryChartProps {
  data: HistoryData;
  title: string;
  color?: string;
  formatValue?: (value: number) => string;
}

export default function HistoryChart({ data, title, color = '#3b82f6', formatValue }: HistoryChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData: HistoryDataPoint[] = data.map(([date, point]) => ({
    date: formatDate(date),
    value: point.value,
    displayValue: point.displayValue,
  }));

  return (
    <div className="bg-gray-900/80  border border-gray-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={formatValue || ((val) => val.toString())}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
            formatter={(value: number) => [formatValue ? formatValue(value) : value, title]}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

