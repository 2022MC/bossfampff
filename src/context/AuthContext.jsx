import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendDiscordWebhook } from '../utils/discordWebhook';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Environment Variables
    const CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';
    const REQUIRED_GUILD_ID = process.env.REACT_APP_DISCORD_GUILD_ID;
    const REQUIRED_ROLE_ID = process.env.REACT_APP_DISCORD_ROLE_ID;

    useEffect(() => {
        // Check sessionStorage for existing session
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Validation: Must have Discord ID (to invalidate old 'admin' login)
            if (parsedUser.id) {
                setCurrentUser(parsedUser);
            } else {
                sessionStorage.removeItem('user'); // Clear legacy session
            }
        }
        setLoading(false);
    }, []);

    const loginWithDiscord = () => {
        // Implicit Grant Flow (response_type=token)
        // Scopes: identify (for username) + guilds.members.read (for roles)
        const scope = encodeURIComponent('identify guilds.members.read');

        if (!CLIENT_ID) {
            alert("Error: Missing Discord Client ID in configuration");
            return;
        }

        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${scope}`;

        window.location.href = authUrl;
    };

    const handleDiscordCallback = async (accessToken, tokenType = 'Bearer') => {
        let tempUser = null; // Store user info if fetched before error

        try {
            // 1. Get User Info
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `${tokenType} ${accessToken}`,
                },
            });

            if (!userResponse.ok) throw new Error('Failed to fetch user info');
            const userData = await userResponse.json();

            tempUser = {
                username: userData.username,
                id: userData.id,
                avatar: userData.avatar,
                role: 'admin' // Default role assign, verified later
            };

            // 2. Check Guild Membership & Role
            if (!REQUIRED_GUILD_ID || !REQUIRED_ROLE_ID) {
                throw new Error("System Configuration Error: Server ID or Role ID is missing.");
            }

            const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${REQUIRED_GUILD_ID}/member`, {
                headers: {
                    Authorization: `${tokenType} ${accessToken}`,
                },
            });

            if (!memberResponse.ok) {
                if (memberResponse.status === 404) {
                    throw new Error('คุณไม่ได้เป็นสมาชิกใน Discord Server ที่กำหนด');
                }
                throw new Error('ไม่สามารถตรวจสอบข้อมูลสมาชิก Discord ได้');
            }

            const memberData = await memberResponse.json();
            const roles = memberData.roles || [];

            // Strict comparison
            if (!roles.includes(REQUIRED_ROLE_ID)) {
                throw new Error('Access Denied: คุณไม่มี "ยศ" (Role) ที่ได้รับอนุญาต');
            }

            // 3. Success
            setCurrentUser(tempUser);
            sessionStorage.setItem('user', JSON.stringify(tempUser));

            // 4. Send Success Webhook
            await sendDiscordWebhook('success', tempUser);

            return tempUser;

        } catch (error) {
            console.error("Discord Auth Error:", error);

            // 5. Send Failure Webhook
            await sendDiscordWebhook('failure', {
                error: error.message || error.toString(),
                user: tempUser // May be null if error occurred before fetching user
            });

            throw error;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('user');
    };

    const value = {
        currentUser,
        loginWithDiscord,
        handleDiscordCallback,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
