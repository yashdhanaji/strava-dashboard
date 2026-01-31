import { subWeeks, subDays, isWithinInterval, parseISO } from 'date-fns';

/**
 * Calculate Performance Score (0-100)
 * Based on:
 * - Consistency (30%): Regularity of workouts
 * - Progress (25%): Pace/speed improvement trend
 * - Volume (25%): Total distance vs rolling average
 * - Variety (20%): Mix of activity types
 */
export const calculatePerformanceScore = (activities, recentWeeks = 4) => {
    if (!activities || activities.length === 0) {
        return { score: 0, breakdown: { consistency: 0, progress: 0, volume: 0, variety: 0 }, trend: 'neutral' };
    }

    const now = new Date();
    const recentStart = subWeeks(now, recentWeeks);
    const previousStart = subWeeks(recentStart, recentWeeks);

    // Filter activities into recent and previous periods
    const recentActivities = activities.filter(a => {
        const date = parseISO(a.start_date);
        return isWithinInterval(date, { start: recentStart, end: now });
    });

    const previousActivities = activities.filter(a => {
        const date = parseISO(a.start_date);
        return isWithinInterval(date, { start: previousStart, end: recentStart });
    });

    // 1. Consistency Score (30%): Activities per week
    const weeksInPeriod = recentWeeks;
    const activitiesPerWeek = recentActivities.length / weeksInPeriod;
    const consistencyScore = Math.min(100, (activitiesPerWeek / 4) * 100); // 4+ activities/week = 100

    // 2. Progress Score (25%): Pace improvement for running
    const recentRuns = recentActivities.filter(a => a.type === 'Run' && a.average_speed > 0);
    const previousRuns = previousActivities.filter(a => a.type === 'Run' && a.average_speed > 0);

    let progressScore = 50; // Default neutral
    if (recentRuns.length > 0 && previousRuns.length > 0) {
        const recentAvgPace = recentRuns.reduce((sum, a) => sum + a.average_speed, 0) / recentRuns.length;
        const previousAvgPace = previousRuns.reduce((sum, a) => sum + a.average_speed, 0) / previousRuns.length;
        const paceImprovement = ((recentAvgPace - previousAvgPace) / previousAvgPace) * 100;
        progressScore = Math.min(100, Math.max(0, 50 + (paceImprovement * 10)));
    }

    // 3. Volume Score (25%): Total distance
    const recentDistance = recentActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
    const previousDistance = previousActivities.reduce((sum, a) => sum + (a.distance || 0), 0);

    let volumeScore = 50;
    if (previousDistance > 0) {
        const volumeChange = ((recentDistance - previousDistance) / previousDistance) * 100;
        volumeScore = Math.min(100, Math.max(0, 50 + (volumeChange * 2)));
    } else if (recentDistance > 0) {
        volumeScore = 70; // Some activity is better than none
    }

    // 4. Variety Score (20%): Different activity types
    const activityTypes = new Set(recentActivities.map(a => a.type));
    const varietyScore = Math.min(100, (activityTypes.size / 3) * 100); // 3+ types = 100

    // Weighted total
    const totalScore = Math.round(
        (consistencyScore * 0.30) +
        (progressScore * 0.25) +
        (volumeScore * 0.25) +
        (varietyScore * 0.20)
    );

    // Determine trend
    let trend = 'neutral';
    if (recentDistance > previousDistance * 1.1) trend = 'up';
    else if (recentDistance < previousDistance * 0.9) trend = 'down';

    return {
        score: totalScore,
        breakdown: {
            consistency: Math.round(consistencyScore),
            progress: Math.round(progressScore),
            volume: Math.round(volumeScore),
            variety: Math.round(varietyScore)
        },
        trend
    };
};

/**
 * Estimate VO2 Max from running activities
 * Using a simplified formula based on pace
 */
export const estimateVO2Max = (runningActivities) => {
    if (!runningActivities || runningActivities.length === 0) return null;

    // Find best effort runs (longer than 10 minutes)
    const validRuns = runningActivities.filter(a =>
        a.type === 'Run' &&
        a.moving_time > 600 &&
        a.average_speed > 0
    );

    if (validRuns.length === 0) return null;

    // Get best pace (highest average speed)
    const bestRun = validRuns.reduce((best, run) =>
        run.average_speed > best.average_speed ? run : best
    );

    // Convert m/s to min/km pace
    const paceMinPerKm = (1000 / bestRun.average_speed) / 60;

    // Simplified VO2 max estimation formula
    // VO2max = 483 / pace(min/km) + 3.5 (very simplified)
    const vo2max = Math.round((483 / paceMinPerKm) + 3.5);

    return Math.min(80, Math.max(20, vo2max)); // Clamp to reasonable range
};

/**
 * Estimate Fitness Age
 * Based on VO2 max and activity level compared to age norms
 */
export const estimateFitnessAge = (activities, actualAge = 30) => {
    if (!activities || activities.length === 0) {
        return { fitnessAge: actualAge, yearsYounger: 0, confidence: 'low' };
    }

    const runningActivities = activities.filter(a => a.type === 'Run');
    const vo2max = estimateVO2Max(runningActivities);

    // Activity frequency factor
    const recentActivities = activities.filter(a => {
        const date = parseISO(a.start_date);
        return isWithinInterval(date, { start: subDays(new Date(), 30), end: new Date() });
    });
    const activitiesPerWeek = (recentActivities.length / 4);

    // Base fitness age calculation
    let fitnessAge = actualAge;
    let confidence = 'medium';

    if (vo2max) {
        // VO2 max typically declines ~1% per year after 25
        // Average VO2 max for 25yo is ~45 (men) or ~40 (women)
        const avgVo2max = 42; // Average
        const vo2maxDiff = vo2max - avgVo2max;

        // Each point above/below average = ~0.5 years younger/older
        fitnessAge = actualAge - (vo2maxDiff * 0.5);
        confidence = 'high';
    }

    // Adjust for activity level
    if (activitiesPerWeek >= 5) {
        fitnessAge -= 2;
    } else if (activitiesPerWeek >= 3) {
        fitnessAge -= 1;
    } else if (activitiesPerWeek < 1) {
        fitnessAge += 2;
    }

    // Ensure reasonable bounds
    fitnessAge = Math.max(18, Math.min(actualAge + 10, Math.round(fitnessAge)));
    const yearsYounger = actualAge - fitnessAge;

    return {
        fitnessAge,
        yearsYounger,
        confidence,
        vo2max
    };
};

/**
 * Generate performance metrics for the metrics table
 */
export const generateMetricsData = (activities) => {
    if (!activities || activities.length === 0) return [];

    const now = new Date();
    const last30Days = activities.filter(a => {
        const date = parseISO(a.start_date);
        return isWithinInterval(date, { start: subDays(now, 30), end: now });
    });

    const runActivities = last30Days.filter(a => a.type === 'Run');
    const rideActivities = last30Days.filter(a => a.type === 'Ride');

    const metrics = [];

    // Average Speed (for runs)
    if (runActivities.length > 0) {
        const avgSpeed = runActivities.reduce((sum, a) => sum + (a.average_speed || 0), 0) / runActivities.length;
        const avgSpeedKmh = (avgSpeed * 3.6).toFixed(1);
        metrics.push({
            id: 'avg-speed',
            name: 'Average Speed',
            value: `${avgSpeedKmh} km/h`,
            numericValue: parseFloat(avgSpeedKmh),
            range: '8-12 km/h',
            optimalRange: [9, 11],
            acceptableRange: [8, 12],
            status: getMetricStatus(parseFloat(avgSpeedKmh), [9, 11], [8, 12]),
            history: generateSparklineData(runActivities, 'average_speed', a => a.average_speed * 3.6),
            category: 'running'
        });
    }

    // Heart Rate (if available)
    const activitiesWithHR = last30Days.filter(a => a.average_heartrate);
    if (activitiesWithHR.length > 0) {
        const avgHR = Math.round(activitiesWithHR.reduce((sum, a) => sum + a.average_heartrate, 0) / activitiesWithHR.length);
        metrics.push({
            id: 'avg-hr',
            name: 'Heart Rate Avg',
            value: `${avgHR} bpm`,
            numericValue: avgHR,
            range: '120-160 bpm',
            optimalRange: [130, 150],
            acceptableRange: [120, 160],
            status: getMetricStatus(avgHR, [130, 150], [120, 160]),
            history: generateSparklineData(activitiesWithHR, 'average_heartrate', a => a.average_heartrate),
            category: 'heart'
        });
    }

    // Weekly Distance
    const weeklyDistance = (last30Days.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000 / 4).toFixed(1);
    metrics.push({
        id: 'weekly-distance',
        name: 'Weekly Distance',
        value: `${weeklyDistance} km`,
        numericValue: parseFloat(weeklyDistance),
        range: '20-60 km',
        optimalRange: [30, 50],
        acceptableRange: [20, 60],
        status: getMetricStatus(parseFloat(weeklyDistance), [30, 50], [20, 60]),
        history: generateWeeklySparklineData(activities, 'distance'),
        category: 'volume'
    });

    // Total Elevation
    const weeklyElevation = Math.round(last30Days.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0) / 4);
    metrics.push({
        id: 'weekly-elevation',
        name: 'Weekly Elevation',
        value: `${weeklyElevation} m`,
        numericValue: weeklyElevation,
        range: '200-800 m',
        optimalRange: [300, 600],
        acceptableRange: [200, 800],
        status: getMetricStatus(weeklyElevation, [300, 600], [200, 800]),
        history: generateWeeklySparklineData(activities, 'total_elevation_gain'),
        category: 'volume'
    });

    // Training Consistency
    const activitiesPerWeek = (last30Days.length / 4).toFixed(1);
    metrics.push({
        id: 'consistency',
        name: 'Training Consistency',
        value: `${activitiesPerWeek}/week`,
        numericValue: parseFloat(activitiesPerWeek),
        range: '3-6/week',
        optimalRange: [4, 5],
        acceptableRange: [3, 6],
        status: getMetricStatus(parseFloat(activitiesPerWeek), [4, 5], [3, 6]),
        history: generateWeeklyActivityCount(activities),
        category: 'training'
    });

    // Longest Run (if runs exist)
    if (runActivities.length > 0) {
        const longestRun = Math.max(...runActivities.map(a => a.distance || 0)) / 1000;
        metrics.push({
            id: 'longest-run',
            name: 'Longest Run',
            value: `${longestRun.toFixed(1)} km`,
            numericValue: longestRun,
            range: '10-25 km',
            optimalRange: [15, 21],
            acceptableRange: [10, 25],
            status: getMetricStatus(longestRun, [15, 21], [10, 25]),
            history: generateSparklineData(runActivities, 'distance', a => a.distance / 1000),
            category: 'running'
        });
    }

    // Cycling Speed (if rides exist)
    if (rideActivities.length > 0) {
        const avgCyclingSpeed = rideActivities.reduce((sum, a) => sum + (a.average_speed || 0), 0) / rideActivities.length;
        const avgCyclingSpeedKmh = (avgCyclingSpeed * 3.6).toFixed(1);
        metrics.push({
            id: 'cycling-speed',
            name: 'Cycling Speed',
            value: `${avgCyclingSpeedKmh} km/h`,
            numericValue: parseFloat(avgCyclingSpeedKmh),
            range: '20-35 km/h',
            optimalRange: [25, 30],
            acceptableRange: [20, 35],
            status: getMetricStatus(parseFloat(avgCyclingSpeedKmh), [25, 30], [20, 35]),
            history: generateSparklineData(rideActivities, 'average_speed', a => a.average_speed * 3.6),
            category: 'cycling'
        });
    }

    return metrics;
};

/**
 * Determine metric status based on value vs ranges
 */
export const getMetricStatus = (value, optimalRange, acceptableRange) => {
    if (value >= optimalRange[0] && value <= optimalRange[1]) {
        return 'optimal';
    } else if (value >= acceptableRange[0] && value <= acceptableRange[1]) {
        return 'in_range';
    }
    return 'out_of_range';
};

/**
 * Generate sparkline data from activities
 */
const generateSparklineData = (activities, key, transform = (a) => a[key]) => {
    return activities
        .slice(-10)
        .map((a, index) => ({
            index,
            value: transform(a) || 0
        }));
};

/**
 * Generate weekly sparkline data
 */
const generateWeeklySparklineData = (activities, key) => {
    const weeks = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
        const weekStart = subWeeks(now, i + 1);
        const weekEnd = subWeeks(now, i);
        const weekActivities = activities.filter(a => {
            const date = parseISO(a.start_date);
            return isWithinInterval(date, { start: weekStart, end: weekEnd });
        });
        const total = weekActivities.reduce((sum, a) => sum + (a[key] || 0), 0);
        weeks.push({ index: 7 - i, value: key === 'distance' ? total / 1000 : total });
    }

    return weeks;
};

/**
 * Generate weekly activity count for sparkline
 */
const generateWeeklyActivityCount = (activities) => {
    const weeks = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
        const weekStart = subWeeks(now, i + 1);
        const weekEnd = subWeeks(now, i);
        const count = activities.filter(a => {
            const date = parseISO(a.start_date);
            return isWithinInterval(date, { start: weekStart, end: weekEnd });
        }).length;
        weeks.push({ index: 7 - i, value: count });
    }

    return weeks;
};

/**
 * Get performance message based on score
 */
export const getPerformanceMessage = (score) => {
    if (score >= 80) {
        return "You're performing exceptionally well! Your training consistency and progress show outstanding dedication.";
    } else if (score >= 60) {
        return "Great work! You're maintaining a solid training routine. Keep pushing to reach your goals.";
    } else if (score >= 40) {
        return "You're on the right track. Consider increasing your training frequency for better results.";
    } else {
        return "Let's get moving! Small steps lead to big improvements. Start with consistency.";
    }
};

/**
 * Get percentile estimate based on score
 */
export const getPercentile = (score) => {
    if (score >= 90) return 5;
    if (score >= 80) return 10;
    if (score >= 70) return 20;
    if (score >= 60) return 35;
    if (score >= 50) return 50;
    return 70;
};
