'use client';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '@/lib/types';

interface Props {
  chart: ChartData;
  delay?: number;
}

const DEFAULT_COLORS = ['#7C3AED', '#06B6D4', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6'];

export default function DynamicChart({ chart, delay = 0 }: Props) {
  const colors = chart.colors || DEFAULT_COLORS;

  const renderChart = () => {
    switch (chart.chart_type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chart.data}>
              <defs>
                {chart.y_keys.map((key, i) => (
                  <linearGradient key={key} id={`line-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey={chart.x_key} stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '12px 16px',
                }}
              />
              {chart.y_keys.length > 1 && <Legend />}
              {chart.y_keys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: colors[i % colors.length] }}
                  activeDot={{ r: 6, stroke: colors[i % colors.length], strokeWidth: 2, fill: '#0A0A0F' }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chart.data}>
              <defs>
                {chart.y_keys.map((key, i) => (
                  <linearGradient key={key} id={`bar-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.4} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey={chart.x_key} stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '12px 16px',
                }}
              />
              {chart.y_keys.length > 1 && <Legend />}
              {chart.y_keys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`url(#bar-${key})`}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={chart.y_keys[0]}
                nameKey={chart.x_key}
                cx="50%"
                cy="50%"
                outerRadius={130}
                innerRadius={60}
                paddingAngle={3}
                strokeWidth={0}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '12px 16px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chart.data}>
              <defs>
                {chart.y_keys.map((key, i) => (
                  <linearGradient key={key} id={`area-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey={chart.x_key} stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '12px 16px',
                }}
              />
              {chart.y_keys.length > 1 && <Legend />}
              {chart.y_keys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  fill={`url(#area-${key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey={chart.x_key} stroke="#64748B" fontSize={12} name={chart.x_label} />
              <YAxis dataKey={chart.y_keys[0]} stroke="#64748B" fontSize={12} name={chart.y_label} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '12px 16px',
                }}
              />
              <Scatter data={chart.data} fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type: {chart.chart_type}</div>;
    }
  };

  return (
    <div className="chart-card animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="chart-card-title">{chart.title}</div>
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
}
