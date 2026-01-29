import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { groupByDayOfWeek, groupByTimeOfDay } from '../../utils/dataProcessing';
import './Charts.css';

const FrequencyChart = ({ activities, type }) => {
    const data = type === 'dayOfWeek' ? groupByDayOfWeek(activities) : groupByTimeOfDay(activities);

    const title = type === 'dayOfWeek' ? 'Activities by Day of Week' : 'Activities by Time of Day';
    const dataKey = type === 'dayOfWeek' ? 'day' : 'time';

    return (
        <div className="chart-card card">
            <h3 className="chart-title">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                    <XAxis
                        dataKey={dataKey}
                        stroke="var(--color-text-tertiary)"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis stroke="var(--color-text-tertiary)" style={{ fontSize: '0.75rem' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                    <Bar
                        dataKey="count"
                        fill="url(#colorGradient)"
                        radius={[8, 8, 0, 0]}
                        name="Activities"
                    />
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent-blue)" stopOpacity={1} />
                            <stop offset="100%" stopColor="var(--color-accent-purple)" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FrequencyChart;
