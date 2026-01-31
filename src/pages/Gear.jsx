import { useState, useEffect } from 'react';
import stravaApi from '../services/stravaApi';
import '../styles/Gear.css';

const Gear = () => {
    const [athlete, setAthlete] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAthleteData();
    }, []);

    const loadAthleteData = async () => {
        try {
            const data = await stravaApi.getAthleteProfile();
            setAthlete(data);
        } catch (error) {
            console.error('Failed to load athlete data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDistance = (meters) => {
        if (!meters) return '0 km';
        return `${(meters / 1000).toFixed(1)} km`;
    };

    if (loading) {
        return (
            <div className="gear-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading gear...</p>
                </div>
            </div>
        );
    }

    const shoes = athlete?.shoes || [];
    const bikes = athlete?.bikes || [];
    const allGear = [...shoes, ...bikes];

    return (
        <div className="gear-page">
            <div className="gear-header">
                <h1>Gear & Equipment</h1>
                <p className="gear-subtitle">Track your equipment usage and mileage</p>
            </div>

            {/* Gear Stats */}
            <div className="gear-stats">
                <div className="gear-stat-card">
                    <span className="gear-stat-icon">👟</span>
                    <div className="gear-stat-content">
                        <span className="gear-stat-value">{shoes.length}</span>
                        <span className="gear-stat-label">Shoes</span>
                    </div>
                </div>
                <div className="gear-stat-card">
                    <span className="gear-stat-icon">🚴</span>
                    <div className="gear-stat-content">
                        <span className="gear-stat-value">{bikes.length}</span>
                        <span className="gear-stat-label">Bikes</span>
                    </div>
                </div>
                <div className="gear-stat-card">
                    <span className="gear-stat-icon">📏</span>
                    <div className="gear-stat-content">
                        <span className="gear-stat-value">
                            {formatDistance(allGear.reduce((sum, g) => sum + (g.distance || 0), 0))}
                        </span>
                        <span className="gear-stat-label">Total Distance</span>
                    </div>
                </div>
            </div>

            {/* Shoes Section */}
            {shoes.length > 0 && (
                <div className="gear-section">
                    <h2 className="gear-section-title">
                        <span>👟</span> Shoes
                    </h2>
                    <div className="gear-grid">
                        {shoes.map((shoe) => (
                            <div key={shoe.id} className="gear-card">
                                <div className="gear-card-header">
                                    <span className="gear-icon">👟</span>
                                    <div className="gear-info">
                                        <h3 className="gear-name">{shoe.name}</h3>
                                        <span className={`gear-status ${shoe.retired ? 'retired' : 'active'}`}>
                                            {shoe.retired ? 'Retired' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                                <div className="gear-card-body">
                                    <div className="gear-metric">
                                        <span className="metric-label">Distance</span>
                                        <span className="metric-value">{formatDistance(shoe.distance)}</span>
                                    </div>
                                    <div className="gear-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.min((shoe.distance / 800000) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="progress-label">
                                            {Math.round((shoe.distance / 800000) * 100)}% of 800km lifespan
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bikes Section */}
            {bikes.length > 0 && (
                <div className="gear-section">
                    <h2 className="gear-section-title">
                        <span>🚴</span> Bikes
                    </h2>
                    <div className="gear-grid">
                        {bikes.map((bike) => (
                            <div key={bike.id} className="gear-card">
                                <div className="gear-card-header">
                                    <span className="gear-icon">🚴</span>
                                    <div className="gear-info">
                                        <h3 className="gear-name">{bike.name}</h3>
                                        <span className={`gear-status ${bike.retired ? 'retired' : 'active'}`}>
                                            {bike.retired ? 'Retired' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                                <div className="gear-card-body">
                                    <div className="gear-metric">
                                        <span className="metric-label">Distance</span>
                                        <span className="metric-value">{formatDistance(bike.distance)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {allGear.length === 0 && (
                <div className="empty-state card">
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>⚙️</div>
                    <h2>No gear found</h2>
                    <p>Add your shoes and bikes in Strava to track their usage here.</p>
                    <a
                        href="https://www.strava.com/settings/gear"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ marginTop: 'var(--spacing-lg)' }}
                    >
                        Add Gear on Strava
                    </a>
                </div>
            )}

            {/* Tips Section */}
            <div className="gear-tips">
                <h3>Gear Tips</h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <span className="tip-icon">👟</span>
                        <div className="tip-content">
                            <h4>Running Shoes</h4>
                            <p>Replace running shoes every 500-800 km to prevent injuries and maintain performance.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🚴</span>
                        <div className="tip-content">
                            <h4>Bike Maintenance</h4>
                            <p>Service your bike chain every 300-500 km and replace it every 3,000-5,000 km.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">📝</span>
                        <div className="tip-content">
                            <h4>Track Everything</h4>
                            <p>Log all your gear on Strava to monitor wear and plan replacements ahead of time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gear;
