import axios from 'axios';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const OAUTH_AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize';
const OAUTH_TOKEN_URL = 'https://www.strava.com/oauth/token';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class StravaAPI {
    constructor() {
        this.client = axios.create({
            baseURL: STRAVA_API_BASE,
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await this.refreshAccessToken();
                        const token = this.getAccessToken();
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, clear tokens and redirect to login
                        this.clearTokens();
                        window.location.href = '/';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // ============================================
    // OAuth & Token Management
    // ============================================

    getAuthorizationUrl() {
        const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_REDIRECT_URI;
        const scope = 'read,activity:read_all,profile:read_all';

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            approval_prompt: 'auto',
            scope: scope,
        });

        return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
    }

    async exchangeToken(code) {
        try {
            const response = await axios.post(OAUTH_TOKEN_URL, {
                client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
                client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
            });

            const { access_token, refresh_token, expires_at, athlete } = response.data;

            // Store tokens
            localStorage.setItem('strava_access_token', access_token);
            localStorage.setItem('strava_refresh_token', refresh_token);
            localStorage.setItem('strava_expires_at', expires_at.toString());
            localStorage.setItem('strava_athlete', JSON.stringify(athlete));

            return { access_token, refresh_token, expires_at, athlete };
        } catch (error) {
            console.error('Token exchange failed:', error);
            throw error;
        }
    }

    async refreshAccessToken() {
        const refreshToken = localStorage.getItem('strava_refresh_token');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post(OAUTH_TOKEN_URL, {
                client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
                client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            });

            const { access_token, refresh_token: new_refresh_token, expires_at } = response.data;

            localStorage.setItem('strava_access_token', access_token);
            localStorage.setItem('strava_refresh_token', new_refresh_token);
            localStorage.setItem('strava_expires_at', expires_at.toString());

            return access_token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }

    getAccessToken() {
        return localStorage.getItem('strava_access_token');
    }

    getAthlete() {
        const athleteData = localStorage.getItem('strava_athlete');
        return athleteData ? JSON.parse(athleteData) : null;
    }

    isTokenExpired() {
        const expiresAt = localStorage.getItem('strava_expires_at');
        if (!expiresAt) return true;

        const now = Math.floor(Date.now() / 1000);
        const expiry = parseInt(expiresAt, 10);

        // Refresh if token expires in less than 1 hour
        return now >= expiry - 3600;
    }

    clearTokens() {
        localStorage.removeItem('strava_access_token');
        localStorage.removeItem('strava_refresh_token');
        localStorage.removeItem('strava_expires_at');
        localStorage.removeItem('strava_athlete');
        cache.clear();
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }

    // ============================================
    // Cache Management
    // ============================================

    getCached(key) {
        const cached = cache.get(key);
        if (!cached) return null;

        const { data, timestamp } = cached;
        if (Date.now() - timestamp > CACHE_TTL) {
            cache.delete(key);
            return null;
        }

        return data;
    }

    setCache(key, data) {
        cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    clearCache() {
        cache.clear();
    }

    // ============================================
    // API Methods
    // ============================================

    async getAthleteProfile() {
        const cacheKey = 'athlete_profile';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.client.get('/athlete');
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch athlete profile:', error);
            throw error;
        }
    }

    async getAthleteStats(athleteId) {
        const cacheKey = `athlete_stats_${athleteId}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.client.get(`/athletes/${athleteId}/stats`);
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch athlete stats:', error);
            throw error;
        }
    }

    async getActivities(params = {}) {
        const { page = 1, per_page = 30, after, before } = params;

        const cacheKey = `activities_${page}_${per_page}_${after}_${before}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.client.get('/athlete/activities', {
                params: {
                    page,
                    per_page,
                    after,
                    before,
                },
            });

            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            throw error;
        }
    }

    async getActivity(id) {
        const cacheKey = `activity_${id}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.client.get(`/activities/${id}`);
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch activity ${id}:`, error);
            throw error;
        }
    }

    async getAllActivities(after, before, onProgress) {
        let allActivities = [];
        let page = 1;
        const per_page = 100; // Max allowed by Strava

        try {
            while (true) {
                const activities = await this.getActivities({
                    page,
                    per_page,
                    after,
                    before,
                });

                if (activities.length === 0) break;

                allActivities = [...allActivities, ...activities];

                if (onProgress) {
                    onProgress(allActivities.length);
                }

                // If we got less than per_page, we've reached the end
                if (activities.length < per_page) break;

                page++;
            }

            return allActivities;
        } catch (error) {
            console.error('Failed to fetch all activities:', error);
            throw error;
        }
    }
}

export default new StravaAPI();
