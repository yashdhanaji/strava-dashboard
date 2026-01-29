import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleCallback } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Authorization was denied. Please try again.');
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            if (!code) {
                setError('No authorization code received.');
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            try {
                const success = await handleCallback(code);
                if (success) {
                    navigate('/dashboard');
                } else {
                    setError('Failed to complete authorization.');
                    setTimeout(() => navigate('/'), 3000);
                }
            } catch (err) {
                console.error('Callback error:', err);
                setError('An error occurred during authorization.');
                setTimeout(() => navigate('/'), 3000);
            }
        };

        processCallback();
    }, [searchParams, handleCallback, navigate]);

    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
                {error ? (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-lg)' }}>❌</div>
                        <h2 style={{ color: 'var(--color-error)' }}>Authorization Failed</h2>
                        <p>{error}</p>
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-md)' }}>
                            Redirecting to login...
                        </p>
                    </>
                ) : (
                    <>
                        <div className="loading-spinner" style={{ margin: '0 auto var(--spacing-lg)' }}></div>
                        <h2>Completing Authorization...</h2>
                        <p className="text-secondary">Please wait while we connect to your Strava account.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Callback;
