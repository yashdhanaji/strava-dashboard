import { useState } from 'react';
import { getLastWeek, getLastMonth, getLastYear, formatDate } from '../utils/dateHelpers';
import './DateRangeSelector.css';

const DateRangeSelector = ({ dateRange, onChange }) => {
    const [customMode, setCustomMode] = useState(false);
    const [startDate, setStartDate] = useState(formatDateInput(dateRange.start));
    const [endDate, setEndDate] = useState(formatDateInput(dateRange.end));

    const presets = [
        { label: 'Last Week', getValue: getLastWeek },
        { label: 'Last Month', getValue: getLastMonth },
        { label: 'Last Year', getValue: getLastYear },
    ];

    const handlePreset = (preset) => {
        setCustomMode(false);
        const range = preset.getValue();
        onChange(range);
        setStartDate(formatDateInput(range.start));
        setEndDate(formatDateInput(range.end));
    };

    const handleCustomApply = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        onChange({ start, end });
    };

    return (
        <div className="date-range-selector">
            <label>Date Range:</label>
            <div className="date-presets">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        className="btn btn-secondary"
                        onClick={() => handlePreset(preset)}
                    >
                        {preset.label}
                    </button>
                ))}
                <button
                    className={`btn btn-secondary ${customMode ? 'active' : ''}`}
                    onClick={() => setCustomMode(!customMode)}
                >
                    Custom Range
                </button>
            </div>

            {customMode && (
                <div className="custom-date-inputs">
                    <div className="date-input-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="date-input-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleCustomApply}>
                        Apply
                    </button>
                </div>
            )}

            <div className="current-range">
                Showing: <strong>{formatDate(dateRange.start)}</strong> to <strong>{formatDate(dateRange.end)}</strong>
            </div>
        </div>
    );
};

function formatDateInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default DateRangeSelector;
