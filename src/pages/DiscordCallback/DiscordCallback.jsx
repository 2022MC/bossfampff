import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DiscordCallback.css';

const DiscordCallback = () => {
    const [status, setStatus] = useState('Processing login...');
    const [error, setError] = useState(null);
    const { handleDiscordCallback } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const processLogin = async () => {
            // 1. Parse hash params (Implicit Grant returns params in hash)
            const fragment = new URLSearchParams(location.hash.slice(1));
            const accessToken = fragment.get('access_token');
            const tokenType = fragment.get('token_type');
            const errorParam = fragment.get('error');

            if (errorParam) {
                setError('Login denied by user or Discord error.');
                return;
            }

            if (!accessToken) {
                setError('No access token received.');
                return;
            }

            try {
                setStatus('Checking your roles...');
                await handleDiscordCallback(accessToken, tokenType);
                navigate('/admin');
            } catch (err) {
                setError(err.message || 'Authentication failed');
            }
        };

        processLogin();
    }, [handleDiscordCallback, navigate, location]);

    return (
        <div className="discord-callback-container">
            <div className="callback-box">
                {error ? (
                    <div className="error-state">
                        <h2>Access Denied</h2>
                        <p className="error-text">{error}</p>
                        <button onClick={() => navigate('/login')} className="btn-back">
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <h2>{status}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscordCallback;
