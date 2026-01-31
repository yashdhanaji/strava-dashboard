import './PerformanceScoreCard.css';

const PerformanceScoreCard = ({ score = 0, maxScore = 100, trend = 'neutral', breakdown }) => {
    const percentage = (score / maxScore) * 100;

    // SVG gauge parameters
    const radius = 45;
    const strokeWidth = 8;
    const circumference = Math.PI * radius; // Semi-circle
    const offset = circumference - (percentage / 100) * circumference;

    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return '↑';
            case 'down': return '↓';
            default: return '→';
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up': return 'var(--color-accent-green)';
            case 'down': return 'var(--color-error)';
            default: return 'var(--color-text-secondary)';
        }
    };

    return (
        <div className="performance-card">
            <div className="performance-card__content">
                <div className="performance-card__header">
                    <span className="performance-card__icon">⚡</span>
                    <h3 className="performance-card__title">Performance Score</h3>
                </div>

                <div className="performance-card__score-container">
                    <span className="performance-card__score">{score}</span>
                    <span className="performance-card__max">out of {maxScore}</span>
                </div>

                <div className="performance-card__trend" style={{ color: getTrendColor() }}>
                    <span className="trend-icon">{getTrendIcon()}</span>
                    <span className="trend-label">
                        {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                </div>
            </div>

            <div className="performance-card__gauge">
                <svg viewBox="0 0 100 60" className="gauge-svg">
                    {/* Background arc */}
                    <path
                        d="M 5 55 A 45 45 0 0 1 95 55"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <path
                        d="M 5 55 A 45 45 0 0 1 95 55"
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="gauge-progress"
                    />
                </svg>
            </div>

            {breakdown && (
                <div className="performance-card__breakdown">
                    <div className="breakdown-item">
                        <span className="breakdown-label">Consistency</span>
                        <span className="breakdown-value">{breakdown.consistency}%</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">Progress</span>
                        <span className="breakdown-value">{breakdown.progress}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceScoreCard;
