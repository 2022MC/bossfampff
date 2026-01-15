import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { FaDiscord } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
    const { loginWithDiscord } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const pass = params.get('pass');

        // Secret Key Logic: Check if pass === 'bossfampf'
        // If not, redirect to Home immediately.
        if (pass !== 'bossfampf') {
            navigate('/');
        }
    }, [location, navigate]);

    return (
        <div className="login-page">
            <Navbar scrollY={100} />
            <div className="login-container">
                <div className="login-box">
                    <h2>Admin Access</h2>
                    <p className="login-desc">Please login with Discord to continue.<br />You must have the required role to access.</p>

                    <button onClick={loginWithDiscord} className="btn-discord-login">
                        <FaDiscord className="discord-icon" /> Login with Discord
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;
