import { formatDistance, formatDuration, formatPace, formatSpeed, formatElevation } from '../utils/dataProcessing';
import { formatDate } from '../utils/dateHelpers';
import './ActivityList.css';

const ActivityList = ({ activities }) => {
    const getActivityIcon = (type) => {
        const icons = {
            Run: '🏃',
            Ride: '🚴',
            Swim: '🏊',
            Walk: '🚶',
            Hike: '🥾',
            Workout: '💪',
            default: '📍',
        };
        return icons[type] || icons.default;
    };

    const getActivityColor = (type) => {
        const colors = {
            Run: 'var(--color-run)',
            Ride: 'var(--color-ride)',
            Swim: 'var(--color-swim)',
            Walk: 'var(--color-walk)',
            Hike: 'var(--color-hike)',
            Workout: 'var(--color-workout)',
        };
        return colors[type] || 'var(--color-accent-blue)';
    };

    return (
        <div className="activity-list">
            {activities.map((activity) => (
                <div key={activity.id} className="activity-card card">
                    <div className="activity-header">
                        <div className="activity-title-section">
                            <div
                                className="activity-icon"
                                style={{ background: getActivityColor(activity.type) }}
                            >
                                {getActivityIcon(activity.type)}
                            </div>
                            <div>
                                <h3 className="activity-name">{activity.name}</h3>
                                <p className="activity-date">{formatDate(activity.start_date)}</p>
                            </div>
                        </div>
                        <span className="activity-type-badge badge badge-primary">
                            {activity.type}
                        </span>
                    </div>

                    <div className="activity-stats">
                        <div className="activity-stat">
                            <span className="stat-icon">📏</span>
                            <div>
                                <div className="stat-value">{formatDistance(activity.distance)}</div>
                                <div className="stat-label">Distance</div>
                            </div>
                        </div>

                        <div className="activity-stat">
                            <span className="stat-icon">⏱️</span>
                            <div>
                                <div className="stat-value">{formatDuration(activity.moving_time)}</div>
                                <div className="stat-label">Duration</div>
                            </div>
                        </div>

                        {activity.average_speed && (
                            <div className="activity-stat">
                                <span className="stat-icon">⚡</span>
                                <div>
                                    <div className="stat-value">
                                        {activity.type === 'Run' || activity.type === 'Walk'
                                            ? formatPace(activity.average_speed)
                                            : formatSpeed(activity.average_speed)}
                                    </div>
                                    <div className="stat-label">
                                        {activity.type === 'Run' || activity.type === 'Walk' ? 'Pace' : 'Speed'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activity.total_elevation_gain > 0 && (
                            <div className="activity-stat">
                                <span className="stat-icon">⛰️</span>
                                <div>
                                    <div className="stat-value">{formatElevation(activity.total_elevation_gain)}</div>
                                    <div className="stat-label">Elevation</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityList;
