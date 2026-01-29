// Date range presets
export const getLastWeek = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return { start, end };
};

export const getLastMonth = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start, end };
};

export const getLastYear = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    return { start, end };
};

export const getCurrentYear = () => {
    const start = new Date(new Date().getFullYear(), 0, 1);
    const end = new Date();
    return { start, end };
};

export const getPreviousPeriod = (start, end) => {
    const duration = end - start;
    const prevEnd = new Date(start);
    const prevStart = new Date(start.getTime() - duration);
    return { start: prevStart, end: prevEnd };
};

export const getYearAgo = (start, end) => {
    const prevStart = new Date(start);
    const prevEnd = new Date(end);
    prevStart.setFullYear(prevStart.getFullYear() - 1);
    prevEnd.setFullYear(prevEnd.getFullYear() - 1);
    return { start: prevStart, end: prevEnd };
};

// Date formatting
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

// Convert to Unix timestamp (seconds)
export const toUnixTimestamp = (date) => {
    return Math.floor(date.getTime() / 1000);
};

// Get day of week
export const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
};

// Get time of day period
export const getTimeOfDay = (date) => {
    const hour = new Date(date).getHours();

    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
};

// Calculate days between dates
export const daysBetween = (start, end) => {
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Week number
export const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};
