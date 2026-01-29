import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
    const { login } = useAuth();

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1 className="login-title">
                        <span className="text-gradient">Strava</span> Stats Dashboard
                    </h1>
                    <p className="login-subtitle">
                        Unlock deeper insights into your athletic performance
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Advanced Analytics</h3>
                        <p>Comprehensive statistics and visualizations beyond the standard Strava interface</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Goal Tracking</h3>
                        <p>Set custom goals and track your progress in real-time</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3>Trend Analysis</h3>
                        <p>Visualize your performance trends over time with beautiful charts</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>Personal Records</h3>
                        <p>Track and celebrate your achievements and best efforts</p>
                    </div>
                </div>

                <div className="login-action">
                    <button className="btn btn-strava btn-lg" onClick={login}>
                        <svg className="strava-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                        </svg>
                        Connect with Strava
                    </button>
                    <p className="login-privacy">
                        We'll never post to Strava or share your data without permission
                    </p>
                </div>

                <div className="login-features-list">
                    <div className="feature-item">
                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Secure OAuth authentication</span>
                    </div>
                    <div className="feature-item">
                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Read-only access to your activities</span>
                    </div>
                    <div className="feature-item">
                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>No data stored on our servers</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
