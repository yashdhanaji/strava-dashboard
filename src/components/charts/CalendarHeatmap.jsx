import { useState } from 'react';
import { formatDate } from '../../utils/dateHelpers';
import './Charts.css';

const CalendarHeatmap = ({ activities }) => {
    const [hoveredDay, setHoveredDay] = useState(null);

    // Get date range from activities
    const dates = activities.map((a) => new Date(a.start_date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Create a map of date -> activity count
    const activityMap = {};
    activities.forEach((activity) => {
        const dateStr = new Date(activity.start_date).toDateString();
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    });

    // Generate calendar grid (last 12 weeks)
    const weeks = 12;
    const calendarData = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    for (let i = 0; i < weeks * 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toDateString();
        const count = activityMap[dateStr] || 0;

        calendarData.push({
            date,
            dateStr,
            count,
        });
    }

    const getIntensityClass = (count) => {
        if (count === 0) return 'intensity-0';
        if (count === 1) return 'intensity-1';
        if (count === 2) return 'intensity-2';
        if (count >= 3) return 'intensity-3';
        return 'intensity-0';
    };

    return (
        <div className="chart-card card">
            <h3 className="chart-title">Activity Calendar Heatmap</h3>
            <div className="calendar-heatmap">
                <div className="heatmap-grid">
                    {calendarData.map((day, index) => (
                        <div
                            key={index}
                            className={`heatmap-cell ${getIntensityClass(day.count)}`}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            title={`${formatDate(day.date)}: ${day.count} activities`}
                        />
                    ))}
                </div>

                {hoveredDay && (
                    <div className="heatmap-tooltip">
                        <div className="tooltip-date">{formatDate(hoveredDay.date)}</div>
                        <div className="tooltip-count">
                            {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
                        </div>
                    </div>
                )}

                <div className="heatmap-legend">
                    <span className="legend-label">Less</span>
                    <div className="heatmap-cell intensity-0"></div>
                    <div className="heatmap-cell intensity-1"></div>
                    <div className="heatmap-cell intensity-2"></div>
                    <div className="heatmap-cell intensity-3"></div>
                    <span className="legend-label">More</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarHeatmap;
