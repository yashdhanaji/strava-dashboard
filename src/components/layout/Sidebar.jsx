import './Sidebar.css';

const SIDEBAR_ITEMS = [
    { id: 'summary', icon: '📊', label: 'Summary', color: 'teal' },
    { id: 'running', icon: '🏃', label: 'Running Metrics', color: 'teal' },
    { id: 'cycling', icon: '🚴', label: 'Cycling Metrics', color: 'teal' },
    { id: 'swimming', icon: '🏊', label: 'Swimming Metrics', color: 'teal' },
    { id: 'heart-rate', icon: '❤️', label: 'Heart Rate Zones', color: 'warning' },
    { id: 'power-pace', icon: '⚡', label: 'Power & Pace', color: 'teal' },
    { id: 'strength', icon: '💪', label: 'Strength Training', color: 'teal' },
    { id: 'training-load', icon: '🎯', label: 'Training Load', color: 'warning' },
    { id: 'trends', icon: '📈', label: 'Performance Trends', color: 'teal' },
    { id: 'records', icon: '🏆', label: 'Personal Records', color: 'teal' },
    { id: 'recovery', icon: '😴', label: 'Recovery Status', color: 'warning' },
    { id: 'energy', icon: '🔋', label: 'Energy Systems', color: 'teal' },
    { id: 'body', icon: '🦵', label: 'Body Composition', color: 'teal' },
    { id: 'gear', icon: '👟', label: 'Gear & Equipment', color: 'teal' },
];

const Sidebar = ({ activeItem, onItemClick, isOpen }) => {
    return (
        <aside className={`sidebar ${isOpen ? '' : 'sidebar--closed'}`}>
            <nav className="sidebar__nav">
                {SIDEBAR_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar__item ${activeItem === item.id ? 'sidebar__item--active' : ''} sidebar__item--${item.color}`}
                        onClick={() => onItemClick(item.id)}
                    >
                        <span className="sidebar__icon">{item.icon}</span>
                        <span className="sidebar__label">{item.label}</span>
                        {activeItem === item.id && (
                            <span className="sidebar__indicator">✓</span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
