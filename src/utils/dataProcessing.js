// ============================================
// Distance Conversions
// ============================================

export const metersToKm = (meters) => {
    return meters / 1000;
};

export const metersToMiles = (meters) => {
    return meters / 1609.34;
};

export const formatDistance = (meters, unit = 'km') => {
    if (unit === 'mi') {
        const miles = metersToMiles(meters);
        return `${miles.toFixed(2)} mi`;
    }
    const km = metersToKm(meters);
    return `${km.toFixed(2)} km`;
};

// ============================================
// Time Conversions
// ============================================

export const formatDuration = (rawSeconds) => {
    const seconds = Math.ceil(rawSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
};

export const formatDurationDetailed = (rawSeconds) => {
    const seconds = Math.ceil(rawSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
};

// ============================================
// Pace Calculations (for running)
// ============================================

export const calculatePace = (meters, seconds) => {
    if (meters === 0) return 0;

    const km = metersToKm(meters);
    const minutes = seconds / 60;
    return minutes / km; // min/km
};

export const formatPace = (metersPerSecond) => {
    if (!metersPerSecond || metersPerSecond === 0) return 'N/A';

    // Convert to min/km
    const kmPerHour = metersPerSecond * 3.6;
    const minPerKm = 60 / kmPerHour;

    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

export const formatPaceMiles = (metersPerSecond) => {
    if (!metersPerSecond || metersPerSecond === 0) return 'N/A';

    // Convert to min/mile
    const milesPerHour = metersPerSecond * 2.23694;
    const minPerMile = 60 / milesPerHour;

    const minutes = Math.floor(minPerMile);
    const seconds = Math.round((minPerMile - minutes) * 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')} /mi`;
};

// ============================================
// Speed Calculations (for cycling)
// ============================================

export const formatSpeed = (metersPerSecond, unit = 'km/h') => {
    if (!metersPerSecond || metersPerSecond === 0) return 'N/A';

    if (unit === 'mph') {
        const mph = metersPerSecond * 2.23694;
        return `${mph.toFixed(1)} mph`;
    }

    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
};

// ============================================
// Elevation
// ============================================

export const formatElevation = (meters, unit = 'm') => {
    if (unit === 'ft') {
        const feet = meters * 3.28084;
        return `${Math.round(feet)} ft`;
    }
    return `${Math.round(meters)} m`;
};

// ============================================
// Statistics Calculations
// ============================================

export const calculateAggregateStats = (activities) => {
    const stats = {
        totalDistance: 0,
        totalTime: 0,
        totalElevation: 0,
        totalActivities: activities.length,
        byType: {},
    };

    activities.forEach((activity) => {
        const { distance, moving_time, total_elevation_gain, type } = activity;

        stats.totalDistance += distance || 0;
        stats.totalTime += moving_time || 0;
        stats.totalElevation += total_elevation_gain || 0;

        // Group by type
        if (!stats.byType[type]) {
            stats.byType[type] = {
                count: 0,
                distance: 0,
                time: 0,
                elevation: 0,
            };
        }

        stats.byType[type].count++;
        stats.byType[type].distance += distance || 0;
        stats.byType[type].time += moving_time || 0;
        stats.byType[type].elevation += total_elevation_gain || 0;
    });

    return stats;
};

export const findPersonalRecords = (activities) => {
    const records = {
        longestDistance: null,
        longestDuration: null,
        fastestPace: null,
        mostElevation: null,
        bestEfforts: {
            '5k': null,
            '10k': null,
            'halfMarathon': null,
            'marathon': null,
        },
        candidates: {
            '5k': [],
            '10k': [],
            'halfMarathon': [],
            'marathon': [],
        }
    };

    // Helper to store candidates locally before sorting
    const allCandidates = {
        '5k': [],
        '10k': [],
        'halfMarathon': [],
        'marathon': [],
    };

    activities.forEach((activity) => {
        const { distance, moving_time, average_speed, total_elevation_gain, type } = activity;

        // Longest distance
        if (!records.longestDistance || distance > records.longestDistance.distance) {
            records.longestDistance = activity;
        }

        // Longest duration
        if (!records.longestDuration || moving_time > records.longestDuration.moving_time) {
            records.longestDuration = activity;
        }

        // Fastest pace (for runs)
        if (type === 'Run' && average_speed) {
            if (!records.fastestPace || average_speed > records.fastestPace.average_speed) {
                records.fastestPace = activity;
            }
        }

        // Most elevation
        if (!records.mostElevation || total_elevation_gain > (records.mostElevation.total_elevation_gain || 0)) {
            records.mostElevation = activity;
        }

        // Best efforts for standard distances (runs only)
        if (type === 'Run' && average_speed > 0) {
            const distanceKm = metersToKm(distance);

            // Helper to check and update record
            const checkRecord = (key, targetKm, minKm) => {
                if (distanceKm >= minKm) {
                    // Calculate projected time for exactly the target distance
                    // Time = Distance / Speed
                    const projectedTime = (targetKm * 1000) / average_speed;

                    // Add to raw list
                    allCandidates[key].push({
                        ...activity,
                        projected_time: projectedTime
                    });
                }
            };

            // 5K (min 4.5 km)
            checkRecord('5k', 5, 4.5);

            // 10K (min 9.5 km)
            checkRecord('10k', 10, 9.5);

            // Half Marathon (min 19.5 km)
            checkRecord('halfMarathon', 21.0975, 19.5);

            // Marathon (min 40.5 km)
            checkRecord('marathon', 42.195, 40.5);
        }
    });

    // Process all candidates to find the best ones
    ['5k', '10k', 'halfMarathon', 'marathon'].forEach(key => {
        // Sort by projected time (ascending)
        allCandidates[key].sort((a, b) => a.projected_time - b.projected_time);

        // Take top 5 as candidates for API verification
        records.candidates[key] = allCandidates[key].slice(0, 5);

        // Set the #1 as the default best effort (fallback)
        records.bestEfforts[key] = records.candidates[key][0] || null;
    });

    return records;
};

export const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

// ============================================
// Chart Data Processing
// ============================================

export const groupByWeek = (activities) => {
    const weeks = {};

    activities.forEach((activity) => {
        const date = new Date(activity.start_date);
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        const key = `${year}-W${week}`;

        if (!weeks[key]) {
            weeks[key] = {
                week: key,
                distance: 0,
                time: 0,
                elevation: 0,
                count: 0,
            };
        }

        weeks[key].distance += activity.distance || 0;
        weeks[key].time += activity.moving_time || 0;
        weeks[key].elevation += activity.total_elevation_gain || 0;
        weeks[key].count++;
    });

    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week));
};

export const groupByMonth = (activities) => {
    const months = {};

    activities.forEach((activity) => {
        const date = new Date(activity.start_date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${(month + 1).toString().padStart(2, '0')}`;

        if (!months[key]) {
            months[key] = {
                month: key,
                distance: 0,
                time: 0,
                elevation: 0,
                count: 0,
            };
        }

        months[key].distance += activity.distance || 0;
        months[key].time += activity.moving_time || 0;
        months[key].elevation += activity.total_elevation_gain || 0;
        months[key].count++;
    });

    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
};

export const groupByDayOfWeek = (activities) => {
    const days = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
    };

    activities.forEach((activity) => {
        const date = new Date(activity.start_date);
        const dayName = getDayOfWeek(date);
        days[dayName]++;
    });

    return Object.entries(days).map(([day, count]) => ({ day, count }));
};

export const groupByTimeOfDay = (activities) => {
    const times = {
        Morning: 0,
        Afternoon: 0,
        Evening: 0,
        Night: 0,
    };

    activities.forEach((activity) => {
        const timeOfDay = getTimeOfDay(activity.start_date);
        times[timeOfDay]++;
    });

    return Object.entries(times).map(([time, count]) => ({ time, count }));
};

// Helper for week number (duplicated from dateHelpers for independence)
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDayOfWeek(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
}

function getTimeOfDay(date) {
    const hour = new Date(date).getHours();

    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}
