import { createContext, useContext, useState, useEffect } from 'react';
import stravaApi from '../services/stravaApi';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            if (stravaApi.isAuthenticated()) {
                // Check if token needs refresh
                if (stravaApi.isTokenExpired()) {
                    await stravaApi.refreshAccessToken();
                }

                const athlete = stravaApi.getAthlete();
                setUser(athlete);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        const authUrl = stravaApi.getAuthorizationUrl();
        window.location.href = authUrl;
    };

    const handleCallback = async (code) => {
        try {
            const { athlete } = await stravaApi.exchangeToken(code);
            setUser(athlete);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Callback handling failed:', error);
            return false;
        }
    };

    const logout = () => {
        stravaApi.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        handleCallback,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
