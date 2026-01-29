import { formatDistance, formatDuration, formatElevation } from '../utils/dataProcessing';
import './StatsPanel.css';

const StatsPanel = ({ stats }) => {
    if (!stats) return null;

    const mainStats = [
        {
            label: 'Total Distance',
            value: formatDistance(stats.totalDistance),
            icon: '🏃',
            gradient: 'var(--gradient-primary)',
        },
        {
            label: 'Total Time',
            value: formatDuration(stats.totalTime),
            icon: '⏱️',
            gradient: 'var(--gradient-secondary)',
        },
        {
            label: 'Total Elevation',
            value: formatElevation(stats.totalElevation),
            icon: '⛰️',
            gradient: 'var(--gradient-success)',
        },
        {
            label: 'Activities',
            value: stats.totalActivities,
            icon: '📊',
            gradient: 'var(--gradient-warning)',
        },
    ];

    return (
        <div className="stats-panel">
            <div className="stats-grid">
                {mainStats.map((stat) => (
                    <div key={stat.label} className="stat-card" style={{ background: stat.gradient }}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {Object.keys(stats.byType).length > 0 && (
                <div className="stats-by-type">
                    <h3>Breakdown by Activity Type</h3>
                    <div className="type-stats-grid">
                        {Object.entries(stats.byType).map(([type, data]) => (
                            <div key={type} className="type-stat-card card">
                                <h4>{type}</h4>
                                <div className="type-stat-details">
                                    <div className="type-stat-item">
                                        <span className="type-stat-label">Activities:</span>
                                        <span className="type-stat-value">{data.count}</span>
                                    </div>
                                    <div className="type-stat-item">
                                        <span className="type-stat-label">Distance:</span>
                                        <span className="type-stat-value">{formatDistance(data.distance)}</span>
                                    </div>
                                    <div className="type-stat-item">
                                        <span className="type-stat-label">Time:</span>
                                        <span className="type-stat-value">{formatDuration(data.time)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsPanel;
