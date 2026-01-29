import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { metersToKm } from '../../utils/dataProcessing';
import './Charts.css';

const COLORS = [
    'var(--color-run)',
    'var(--color-ride)',
    'var(--color-swim)',
    'var(--color-walk)',
    'var(--color-hike)',
    'var(--color-workout)',
];

const DistributionChart = ({ activities }) => {
    // Group by activity type
    const typeData = activities.reduce((acc, activity) => {
        const type = activity.type;
        if (!acc[type]) {
            acc[type] = { type, distance: 0, count: 0 };
        }
        acc[type].distance += activity.distance || 0;
        acc[type].count++;
        return acc;
    }, {});

    const chartData = Object.values(typeData).map((item) => ({
        name: item.type,
        value: parseFloat(metersToKm(item.distance).toFixed(2)),
        count: item.count,
    }));

    return (
        <div className="chart-card card">
            <h3 className="chart-title">Distance Distribution by Activity Type</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                        }}
                        formatter={(value, name, props) => [
                            `${value} km (${props.payload.count} activities)`,
                            name,
                        ]}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DistributionChart;
