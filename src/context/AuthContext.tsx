"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sendDiscordWebhook } from '../utils/discordWebhook';

interface User {
    username: string;
    id: string;
    avatar: string;
    role: string;
}

interface AuthContextType {
    currentUser: User | null;
    loginWithDiscord: () => void;
    handleDiscordCallback: (accessToken: string, tokenType?: string) => Promise<User | null>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Environment Variables with NEXT_PUBLIC_ prefix support
    const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_REACT_APP_DISCORD_CLIENT_ID;
    const GUILD_ID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || process.env.NEXT_PUBLIC_REACT_APP_DISCORD_GUILD_ID;
    const ROLE_ID = process.env.NEXT_PUBLIC_DISCORD_ROLE_ID || process.env.NEXT_PUBLIC_REACT_APP_DISCORD_ROLE_ID;

    useEffect(() => {
        // Check sessionStorage for existing session
        if (typeof window !== 'undefined') {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Validation: Must have Discord ID (to invalidate old 'admin' login)
                    if (parsedUser.id) {
                        setCurrentUser(parsedUser);
                    } else {
                        sessionStorage.removeItem('user'); // Clear legacy session
                    }
                } catch (e) {
                    sessionStorage.removeItem('user');
                }
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
            console.error("Missing NEXT_PUBLIC_DISCORD_CLIENT_ID");
            return;
        }

        const REDIRECT_URI = `${window.location.origin}/auth/discord/callback`;
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${scope}`;

        window.location.href = authUrl;
    };

    const handleDiscordCallback = async (accessToken: string, tokenType: string = 'Bearer') => {
        let tempUser: User | null = null; // Store user info if fetched before error

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
            const targetGuildId = GUILD_ID?.trim();
            const targetRoleId = ROLE_ID?.trim();

            if (!targetGuildId || !targetRoleId) {
                throw new Error(`System Configuration Error: Server ID/Role ID missing.`);
            }

            const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${targetGuildId}/member`, {
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

            console.log("Debug Role Check:", roles);

            // Strict comparison
            if (!roles.includes(targetRoleId)) {
                throw new Error(`Access Denied: คุณไม่มี "ยศ" (Role) ที่ได้รับอนุญาต.`);
            }

            // 3. Success
            setCurrentUser(tempUser);
            sessionStorage.setItem('user', JSON.stringify(tempUser));

            // 4. Send Success Webhook
            await sendDiscordWebhook('success', tempUser);

            return tempUser;

        } catch (error: any) {
            console.error("Discord Auth Error:", error);

            // 5. Send Failure Webhook
            await sendDiscordWebhook('failure', {
                error: error.message || error.toString(),
                user: tempUser
            });

            throw error;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ currentUser, loginWithDiscord, handleDiscordCallback, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
