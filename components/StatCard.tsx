interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800/50 rounded-lg p-6 hover:border-gray-700/70 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">{title}</h3>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <span className={`text-sm ${trendColors[trend]}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );
}

