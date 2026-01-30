import { useState, useEffect } from 'react';
import { formatDistance, formatDuration, formatPace, formatElevation } from '../utils/dataProcessing';
import { formatDate } from '../utils/dateHelpers';
import stravaApi from '../services/stravaApi'; // Import API service
import Modal from './Modal';
import ActivityDetail from './ActivityDetail';
import './PersonalRecords.css';

const PersonalRecords = ({ records }) => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Stores the verified "best" time for each distance
    const [detailedEfforts, setDetailedEfforts] = useState({});

    // Stores the verified "best" activity for each distance (might differ from initial estimate)
    const [bestActivities, setBestActivities] = useState({});

    // Fetch confirmed best efforts by checking top candidates
    useEffect(() => {
        if (!records) return;

        const distances = [
            { key: '5k', name: '5k' },
            { key: '10k', name: '10k' },
            { key: 'halfMarathon', name: 'Half-Marathon' },
            { key: 'marathon', name: 'Marathon' },
        ];

        const verifyRecords = async () => {
            const verifiedEfforts = {};
            const verifiedActivities = {};
            const checkedCache = new Set(); // Avoid re-fetching same activity for different distances

            for (const { key, name } of distances) {
                // Use list of candidates if available, otherwise fallback to the single best effort
                const candidates = records.candidates?.[key] ||
                    (records.bestEfforts[key] ? [records.bestEfforts[key]] : []);

                let bestTime = Infinity;
                let winningActivity = null;

                // Check candidates to find the true best effort
                // We limit to top 5 candidates which is reasonable
                for (const candidate of candidates) {
                    if (!candidate) continue;

                    try {
                        let detail;
                        // Simple in-memory cache for this render cycle
                        // (stravaApi has its own cache but this saves logic)
                        detail = await stravaApi.getActivity(candidate.id);

                        // Find the specific best effort from the array
                        const bestEffort = detail.best_efforts?.find(
                            (e) => e.name === name || (name === 'Half-Marathon' && e.name === 'Half-Marathon')
                        );

                        if (bestEffort) {
                            if (bestEffort.moving_time < bestTime) {
                                bestTime = bestEffort.moving_time;
                                winningActivity = candidate;
                            }
                        } else {
                            // Only fallback to projected if we haven't found ANY official effort yet
                            // and this is our primary candidate
                            if (winningActivity === null && candidate.projected_time < bestTime) {
                                bestTime = candidate.projected_time;
                                winningActivity = candidate;
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to verify candidate for ${key}`, err);
                    }
                }

                if (winningActivity) {
                    verifiedEfforts[key] = bestTime;
                    verifiedActivities[key] = winningActivity;
                }
            }

            if (Object.keys(verifiedEfforts).length > 0) {
                setDetailedEfforts(prev => ({ ...prev, ...verifiedEfforts }));
                setBestActivities(prev => ({ ...prev, ...verifiedActivities }));
            }
        };

        verifyRecords();
    }, [records]);


    if (!records) return null;

    const handleRecordClick = (activity) => {
        if (activity) {
            setSelectedActivity(activity);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedActivity(null);
    };

    const recordCards = [
        {
            title: 'Longest Distance',
            icon: '🏅',
            activity: records.longestDistance,
            value: records.longestDistance ? formatDistance(records.longestDistance.distance) : 'N/A',
            gradient: 'var(--gradient-primary)',
        },
        {
            title: 'Longest Duration',
            icon: '⏰',
            activity: records.longestDuration,
            value: records.longestDuration ? formatDuration(records.longestDuration.moving_time) : 'N/A',
            gradient: 'var(--gradient-secondary)',
        },
        {
            title: 'Fastest Pace',
            icon: '⚡',
            activity: records.fastestPace,
            value: records.fastestPace ? formatPace(records.fastestPace.average_speed) : 'N/A',
            gradient: 'var(--gradient-success)',
        },
        {
            title: 'Most Elevation',
            icon: '⛰️',
            activity: records.mostElevation,
            value: records.mostElevation ? formatElevation(records.mostElevation.total_elevation_gain) : 'N/A',
            gradient: 'var(--gradient-warning)',
        },
    ];

    const bestEfforts = [
        { label: '5K', key: '5k', distance: '5 km' },
        { label: '10K', key: '10k', distance: '10 km' },
        { label: 'Half Marathon', key: 'halfMarathon', distance: '21.1 km' },
        { label: 'Marathon', key: 'marathon', distance: '42.2 km' },
    ];

    return (
        <div className="personal-records">
            <div className="records-grid">
                {recordCards.map((record) => (
                    <div
                        key={record.title}
                        className={`record-card ${record.activity ? 'clickable' : ''}`}
                        style={{ background: record.gradient, cursor: record.activity ? 'pointer' : 'default' }}
                        onClick={() => handleRecordClick(record.activity)}
                    >
                        <div className="record-icon">{record.icon}</div>
                        <div className="record-content">
                            <div className="record-title">{record.title}</div>
                            <div className="record-value">{record.value}</div>
                            {record.activity && (
                                <div className="record-details">
                                    <div className="record-activity-name">{record.activity.name}</div>
                                    <div className="record-date">{formatDate(record.activity.start_date)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Only show best efforts header if there's at least one record */}
            {(Object.values(records.bestEfforts).some(e => e) || Object.keys(bestActivities).length > 0) && (
                <div className="best-efforts-section">
                    <h3>Best Running Efforts</h3>
                    <div className="best-efforts-grid">
                        {bestEfforts.map((effort) => {
                            // Use confirmed best activity if found, otherwise fallback to initial estimate
                            const activity = bestActivities[effort.key] || records.bestEfforts[effort.key];
                            // Use confirmed time if found, otherwise projected
                            const displayTime = detailedEfforts[effort.key] || activity?.projected_time;

                            return (
                                <div
                                    key={effort.key}
                                    className={`effort-card card ${activity ? 'clickable' : ''}`}
                                    onClick={() => handleRecordClick(activity)}
                                >
                                    <div className="effort-header">
                                        <div className="effort-distance-badge">{effort.label}</div>
                                        <div className="effort-distance-label">{effort.distance}</div>
                                    </div>
                                    {activity ? (
                                        <>
                                            <div className="effort-time">{formatDuration(displayTime)}</div>
                                            <div className="effort-pace">
                                                Avg Pace: {formatPace(activity.average_speed)}
                                            </div>
                                            <div className="effort-details">
                                                <div className="effort-name">{activity.name}</div>
                                                <div className="effort-date">{formatDate(activity.start_date)}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="effort-empty">No record yet</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedActivity ? selectedActivity.name : 'Activity Details'}
            >
                {selectedActivity && (
                    <ActivityDetail
                        activityId={selectedActivity.id}
                        initialData={selectedActivity}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PersonalRecords;
