import { useState, useEffect } from 'react';
import { formatDistance, formatDuration, formatPace, formatSpeed, formatElevation, metersToKm } from '../utils/dataProcessing';
import { formatDate } from '../utils/dateHelpers';
import stravaApi from '../services/stravaApi';
import './ActivityDetail.css';

const ActivityDetail = ({ activityId, initialData }) => {
    const [activity, setActivity] = useState(initialData);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetailedActivity = async () => {
            // If we don't have data, or if we want to ensure we have detailed data (like splits)
            if (!initialData || !initialData.splits_metric) {
                try {
                    setLoading(true);
                    const data = await stravaApi.getActivity(activityId);
                    setActivity(data);
                } catch (err) {
                    console.error('Error fetching activity details:', err);
                    setError('Failed to load full activity details.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDetailedActivity();
    }, [activityId, initialData]);

    if (loading) {
        return (
            <div className="activity-detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading full details...</p>
            </div>
        );
    }

    if (error && !activity) {
        return <div className="activity-detail-error">{error}</div>;
    }

    if (!activity) return null;

    const isRun = activity.type === 'Run';
    const isRide = activity.type === 'Ride';

    return (
        <div className="activity-detail">
            <div className="detail-header">
                <div className="detail-meta">
                    <span className="detail-type badge badge-primary">{activity.type}</span>
                    <span className="detail-date">{formatDate(activity.start_date)}</span>
                </div>
                <div className="detail-stats-grid">
                    <div className="detail-stat-card">
                        <span className="detail-stat-label">Distance</span>
                        <span className="detail-stat-value">{formatDistance(activity.distance)}</span>
                    </div>
                    <div className="detail-stat-card">
                        <span className="detail-stat-label">Time</span>
                        <span className="detail-stat-value">{formatDuration(activity.moving_time)}</span>
                    </div>
                    <div className="detail-stat-card">
                        <span className="detail-stat-label">Avg Pace/Speed</span>
                        <span className="detail-stat-value">
                            {isRun ? formatPace(activity.average_speed) : formatSpeed(activity.average_speed)}
                        </span>
                    </div>
                    <div className="detail-stat-card">
                        <span className="detail-stat-label">Elevation</span>
                        <span className="detail-stat-value">{formatElevation(activity.total_elevation_gain)}</span>
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h3>Analysis</h3>
                <div className="analysis-grid">
                    <div className="analysis-item">
                        <span className="analysis-label">Max Speed</span>
                        <span className="analysis-value">
                            {isRun ? formatPace(activity.max_speed) : formatSpeed(activity.max_speed)}
                        </span>
                    </div>
                    <div className="analysis-item">
                        <span className="analysis-label">Calories</span>
                        <span className="analysis-value">{Math.round(activity.calories || activity.kilojoules || 0)}</span>
                    </div>
                    {activity.average_heartrate && (
                        <div className="analysis-item">
                            <span className="analysis-label">Avg HR</span>
                            <span className="analysis-value">{Math.round(activity.average_heartrate)} bpm</span>
                        </div>
                    )}
                    {activity.max_heartrate && (
                        <div className="analysis-item">
                            <span className="analysis-label">Max HR</span>
                            <span className="analysis-value">{Math.round(activity.max_heartrate)} bpm</span>
                        </div>
                    )}
                </div>
            </div>

            {activity.splits_metric && activity.splits_metric.length > 0 && (
                <div className="detail-section">
                    <h3>Splits (km)</h3>
                    <div className="splits-table-container">
                        <table className="splits-table">
                            <thead>
                                <tr>
                                    <th>Km</th>
                                    <th>Pace</th>
                                    <th>Elev</th>
                                    <th>HR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.splits_metric.map((split, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{formatPace(split.average_speed)}</td>
                                        <td>{Math.round(split.elevation_difference || 0)}m</td>
                                        <td>{split.average_heartrate ? Math.round(split.average_heartrate) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="detail-actions">
                <a
                    href={`https://www.strava.com/activities/${activity.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >
                    View on Strava ↗
                </a>
            </div>
        </div>
    );
};

export default ActivityDetail;
