import { LineChart, Line, ResponsiveContainer } from 'recharts';

const SparklineChart = ({ data = [], color = 'var(--color-accent-blue)', width = 80, height = 30 }) => {
    if (!data || data.length === 0) {
        return <div className="sparkline-empty" style={{ width, height }} />;
    }

    return (
        <div className="sparkline-chart" style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SparklineChart;
