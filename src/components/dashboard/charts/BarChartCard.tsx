import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface BarChartCardProps {
  title: string;
  data: Array<{ name: string; value: number; [key: string]: string | number }>;
  dataKey?: string;
  colors?: string[];
  height?: number;
  loading?: boolean;
  horizontal?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
];

export function BarChartCard({
  title,
  data,
  dataKey = 'value',
  colors = DEFAULT_COLORS,
  height = 300,
  loading = false,
  horizontal = false
}: BarChartCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout={horizontal ? 'vertical' : 'horizontal'}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            {horizontal ? (
              <>
                <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#6b7280' }}
                />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar
              dataKey={dataKey}
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
