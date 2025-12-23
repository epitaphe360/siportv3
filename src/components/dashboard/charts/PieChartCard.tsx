import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface PieChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  loading?: boolean;
  showPercentage?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
];

export function PieChartCard({
  title,
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  loading = false,
  showPercentage = true
}: PieChartCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-full mx-auto w-64"></div>
        </div>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderLabel = (entry: any) => {
    if (!showPercentage) return '';
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1500}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.map((item, index) => {
            const percent = ((item.value / total) * 100).toFixed(1);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center space-x-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{item.name}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.value} ({percent}%)
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
