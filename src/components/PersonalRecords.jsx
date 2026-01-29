import { useState } from 'react';
import { formatDistance, formatDuration, formatPace, formatElevation } from '../utils/dataProcessing';
import { formatDate } from '../utils/dateHelpers';
import Modal from './Modal';
import ActivityDetail from './ActivityDetail';
import './PersonalRecords.css';

const PersonalRecords = ({ records }) => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

            {Object.values(records.bestEfforts).some((effort) => effort) && (
                <div className="best-efforts-section">
                    <h3>Best Running Efforts</h3>
                    <div className="best-efforts-grid">
                        {bestEfforts.map((effort) => {
                            const activity = records.bestEfforts[effort.key];
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
                                            <div className="effort-time">{formatDuration(activity.projected_time)}</div>
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
