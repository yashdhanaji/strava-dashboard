import './UserGreeting.css';

const UserGreeting = ({ user, performanceMessage, percentile }) => {
    const firstName = user?.firstname || 'Athlete';

    return (
        <div className="user-greeting">
            <div className="user-greeting__header">
                <h1 className="user-greeting__name">{firstName}</h1>
                <span className="user-greeting__badge">Athlete</span>
            </div>
            {performanceMessage && (
                <p className="user-greeting__message">
                    {performanceMessage}
                    {percentile && (
                        <span className="user-greeting__percentile">
                            {' '}Your performance score puts you in the top {percentile}% of Strava athletes.
                        </span>
                    )}
                </p>
            )}
        </div>
    );
};

export default UserGreeting;
