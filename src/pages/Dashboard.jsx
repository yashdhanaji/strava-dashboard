import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import stravaApi from '../services/stravaApi';
import { getLastMonth, toUnixTimestamp } from '../utils/dateHelpers';
import { calculateAggregateStats, findPersonalRecords } from '../utils/dataProcessing';
import DateRangeSelector from '../components/DateRangeSelector';
import StatsPanel from '../components/StatsPanel';
import ActivityList from '../components/ActivityList';
import PersonalRecords from '../components/PersonalRecords';
import TrendChart from '../components/charts/TrendChart';
import FrequencyChart from '../components/charts/FrequencyChart';
import DistributionChart from '../components/charts/DistributionChart';
import CalendarHeatmap from '../components/charts/CalendarHeatmap';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [dateRange, setDateRange] = useState(getLastMonth());
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [stats, setStats] = useState(null);
    const [records, setRecords] = useState(null);

    useEffect(() => {
        loadActivities();
    }, [dateRange]);

    useEffect(() => {
        filterActivities();
    }, [activities, selectedTypes]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const after = toUnixTimestamp(dateRange.start);
            const before = toUnixTimestamp(dateRange.end);

            const data = await stravaApi.getAllActivities(after, before, (count) => {
                console.log(`Loaded ${count} activities...`);
            });

            setActivities(data);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterActivities = () => {
        let filtered = activities;

        if (selectedTypes.length > 0) {
            filtered = activities.filter((activity) =>
                selectedTypes.includes(activity.type)
            );
        }

        setFilteredActivities(filtered);

        // Calculate stats and records
        if (filtered.length > 0) {
            setStats(calculateAggregateStats(filtered));
            setRecords(findPersonalRecords(filtered));
        } else {
            setStats(null);
            setRecords(null);
        }
    };

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
    };

    const handleTypeFilterChange = (types) => {
        setSelectedTypes(types);
    };

    // Get available activity types
    const activityTypes = [...new Set(activities.map((a) => a.type))];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="container">
                    <div className="flex-between">
                        <div>
                            <h1>Welcome back, <span className="text-gradient">{user?.firstname}</span>!</h1>
                            <p className="text-secondary">Here's your athletic performance overview</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container dashboard-content">
                <div className="dashboard-controls">
                    <DateRangeSelector
                        dateRange={dateRange}
                        onChange={handleDateRangeChange}
                    />

                    {activityTypes.length > 0 && (
                        <div className="activity-type-filter">
                            <label>Filter by Activity Type:</label>
                            <div className="type-buttons">
                                {activityTypes.map((type) => (
                                    <button
                                        key={type}
                                        className={`btn btn-ghost type-btn ${selectedTypes.includes(type) ? 'active' : ''}`}
                                        onClick={() => {
                                            if (selectedTypes.includes(type)) {
                                                setSelectedTypes(selectedTypes.filter((t) => t !== type));
                                            } else {
                                                setSelectedTypes([...selectedTypes, type]);
                                            }
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                                {selectedTypes.length > 0 && (
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => setSelectedTypes([])}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your activities...</p>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="empty-state card">
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>🏃</div>
                        <h2>No activities found</h2>
                        <p>Try adjusting your date range or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="section">
                            <h2 className="section-title">Overview Statistics</h2>
                            <StatsPanel stats={stats} />
                        </div>

                        <div className="section">
                            <h2 className="section-title">Activity Trends</h2>
                            <div className="grid grid-2">
                                <TrendChart activities={filteredActivities} />
                                <DistributionChart activities={filteredActivities} />
                            </div>
                        </div>

                        <div className="section">
                            <h2 className="section-title">Activity Patterns</h2>
                            <div className="grid grid-2">
                                <FrequencyChart activities={filteredActivities} type="dayOfWeek" />
                                <FrequencyChart activities={filteredActivities} type="timeOfDay" />
                            </div>
                        </div>

                        <div className="section">
                            <h2 className="section-title">Activity Calendar</h2>
                            <CalendarHeatmap activities={filteredActivities} />
                        </div>

                        <div className="section">
                            <h2 className="section-title">Personal Records</h2>
                            <PersonalRecords records={records} />
                        </div>

                        <div className="section">
                            <h2 className="section-title">Recent Activities</h2>
                            <ActivityList activities={filteredActivities.slice(0, 20)} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
