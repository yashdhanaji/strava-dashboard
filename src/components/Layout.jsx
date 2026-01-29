import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="layout">
            <header className="app-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <h1>
                                <span className="text-gradient">Strava</span> Stats
                            </h1>
                        </div>

                        <div className="header-actions">
                            {user && (
                                <>
                                    <div className="user-info">
                                        {user.profile && (
                                            <img
                                                src={user.profile}
                                                alt={`${user.firstname} ${user.lastname}`}
                                                className="user-avatar"
                                            />
                                        )}
                                        <span className="user-name">
                                            {user.firstname} {user.lastname}
                                        </span>
                                    </div>
                                    <button onClick={logout} className="btn btn-ghost">
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="app-main">{children}</main>

            <footer className="app-footer">
                <div className="container">
                    <p>
                        Built with ❤️ using the Strava API • Not affiliated with Strava, Inc.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
