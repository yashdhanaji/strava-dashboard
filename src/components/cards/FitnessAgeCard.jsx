import './FitnessAgeCard.css';

const FitnessAgeCard = ({ fitnessAge = 30, actualAge = 30, yearsYounger = 0, vo2max }) => {
    const isYounger = yearsYounger > 0;
    const agePosition = Math.max(0, Math.min(100, ((actualAge - fitnessAge + 10) / 20) * 100));

    return (
        <div className="fitness-card">
            <div className="fitness-card__content">
                <div className="fitness-card__header">
                    <span className="fitness-card__icon">💪</span>
                    <h3 className="fitness-card__title">Fitness Age</h3>
                </div>

                <div className="fitness-card__age-container">
                    <span className="fitness-card__age">{fitnessAge}</span>
                    <span className="fitness-card__unit">years</span>
                </div>

                <div className={`fitness-card__comparison ${isYounger ? 'younger' : 'older'}`}>
                    {isYounger ? (
                        <>
                            <span className="comparison-icon">↓</span>
                            <span className="comparison-text">{yearsYounger.toFixed(1)} years younger</span>
                        </>
                    ) : yearsYounger < 0 ? (
                        <>
                            <span className="comparison-icon">↑</span>
                            <span className="comparison-text">{Math.abs(yearsYounger).toFixed(1)} years older</span>
                        </>
                    ) : (
                        <span className="comparison-text">Same as actual age</span>
                    )}
                </div>
            </div>

            <div className="fitness-card__timeline">
                <div className="timeline-track">
                    <div
                        className="timeline-marker fitness-marker"
                        style={{ left: `${agePosition}%` }}
                    >
                        <span className="marker-label">Fitness</span>
                    </div>
                    <div
                        className="timeline-marker actual-marker"
                        style={{ left: '50%' }}
                    >
                        <span className="marker-label">Actual ({actualAge})</span>
                    </div>
                </div>
                <div className="timeline-labels">
                    <span>{actualAge - 10}</span>
                    <span>{actualAge + 10}</span>
                </div>
            </div>

            {vo2max && (
                <div className="fitness-card__vo2">
                    <span className="vo2-label">Est. VO2 Max</span>
                    <span className="vo2-value">{vo2max}</span>
                </div>
            )}

            <div className="fitness-card__decoration">
                <svg viewBox="0 0 100 100" className="decoration-svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                    <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                </svg>
            </div>
        </div>
    );
};

export default FitnessAgeCard;
