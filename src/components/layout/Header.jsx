import './Header.css';

const NAV_ITEMS = [
    { id: 'activities', label: 'Activities' },
    { id: 'stats', label: 'Stats' },
    { id: 'training', label: 'Training' },
    { id: 'social', label: 'Social' },
    { id: 'gear', label: 'Gear' },
];

const Header = ({ user, activeNav, onNavChange, onLogout, onToggleSidebar }) => {
    return (
        <header className="header">
            <div className="header__left">
                <button className="header__menu-btn" onClick={onToggleSidebar}>
                    <span className="menu-icon">☰</span>
                </button>
                <div className="header__logo">
                    <span className="logo-icon">🏃</span>
                    <span className="logo-text">Strava Stats</span>
                </div>
            </div>

            <nav className="header__nav">
                <div className="nav-pills">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-pill ${activeNav === item.id ? 'nav-pill--active' : ''}`}
                            onClick={() => onNavChange(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            <div className="header__right">
                <button className="header__action-btn">
                    <span>Invite Friend</span>
                </button>
                <button className="header__icon-btn">
                    <span className="notification-icon">🔔</span>
                </button>
                {user && (
                    <div className="header__user">
                        <img
                            src={user.profile}
                            alt={user.firstname}
                            className="header__avatar"
                        />
                        <div className="header__user-menu">
                            <span className="header__user-name">{user.firstname}</span>
                            <button className="header__logout-btn" onClick={onLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
