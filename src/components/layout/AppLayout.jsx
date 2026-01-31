import { useState } from 'react';
import Header from './Header';
import Dashboard from '../../pages/Dashboard';
import Activities from '../../pages/Activities';
import Gear from '../../pages/Gear';
import './AppLayout.css';

const AppLayout = ({ user, onLogout }) => {
    const [activeNav, setActiveNav] = useState('stats');

    const handleNavChange = (nav) => {
        setActiveNav(nav);
    };

    const renderContent = () => {
        switch (activeNav) {
            case 'activities':
                return <Activities />;
            case 'stats':
                return <Dashboard />;
            case 'gear':
                return <Gear />;
            case 'training':
                return (
                    <div className="placeholder-page">
                        <div className="placeholder-icon">🏋️</div>
                        <h2>Training</h2>
                        <p>Training plans and workouts coming soon!</p>
                    </div>
                );
            case 'social':
                return (
                    <div className="placeholder-page">
                        <div className="placeholder-icon">👥</div>
                        <h2>Social</h2>
                        <p>Connect with friends and clubs coming soon!</p>
                    </div>
                );
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="app-layout">
            <Header
                user={user}
                activeNav={activeNav}
                onNavChange={handleNavChange}
                onLogout={onLogout}
            />
            <main className="app-layout__main">
                {renderContent()}
            </main>
        </div>
    );
};

export default AppLayout;
