import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { groupByWeek, groupByMonth, metersToKm } from '../../utils/dataProcessing';
import './Charts.css';

const TrendChart = ({ activities }) => {
    // Group by week for trends
    const weeklyData = groupByWeek(activities);

    // Transform for chart
    const chartData = weeklyData.map((week) => ({
        week: week.week,
        distance: parseFloat(metersToKm(week.distance).toFixed(2)),
        elevation: Math.round(week.elevation),
        activities: week.count,
    }));

    return (
        <div className="chart-card card">
            <h3 className="chart-title">Weekly Distance & Elevation Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                    <XAxis
                        dataKey="week"
                        stroke="var(--color-text-tertiary)"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="var(--color-accent-blue)"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--color-accent-purple)"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="distance"
                        stroke="var(--color-accent-blue)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--color-accent-blue)', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Distance (km)"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="elevation"
                        stroke="var(--color-accent-purple)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--color-accent-purple)', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Elevation (m)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
