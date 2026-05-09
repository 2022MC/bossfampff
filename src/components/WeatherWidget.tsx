"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiSnow, WiFog } from 'react-icons/wi';

const WeatherWidget = () => {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationName, setLocationName] = useState('Bangkok');

    const DEFAULT_LAT = 13.7563;
    const DEFAULT_LON = 100.5018;

    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                    setLocationName('Local Weather');
                },
                (err) => {
                    console.warn("Location access denied, using default:", err);
                    fetchWeather(DEFAULT_LAT, DEFAULT_LON);
                    setLocationName('Bangkok');
                }
            );
        } else {
            fetchWeather(DEFAULT_LAT, DEFAULT_LON);
            setLocationName('Bangkok');
        }
    }, []);

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            if (!response.ok) throw new Error('Weather data fetch failed');
            const data = await response.json();
            setWeather(data.current_weather);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (code: number) => {
        if (code === 0) return <WiDaySunny className="text-2xl text-amber-400" />;
        if (code >= 1 && code <= 3) return <WiCloudy className="text-2xl text-slate-400" />;
        if (code === 45 || code === 48) return <WiFog className="text-2xl text-slate-300" />;
        if (code >= 51 && code <= 67) return <WiRain className="text-2xl text-cyan-400" />;
        if (code >= 71 && code <= 77) return <WiSnow className="text-2xl text-white" />;
        if (code >= 95) return <WiThunderstorm className="text-2xl text-violet-400" />;
        return <WiDaySunny className="text-2xl text-white" />;
    };

    if (loading) return null;
    if (error) return null;

    return (
        <motion.div
            className="backdrop-blur-xl rounded-full px-4 py-2 inline-flex items-center gap-3 mb-4"
            style={{
                background: 'rgba(6, 182, 212, 0.06)',
                border: '1px solid rgba(6, 182, 212, 0.12)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
        >
            <div className="flex items-center gap-2">
                {weather && getWeatherIcon(weather.weathercode)}
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{weather ? Math.round(weather.temperature) : '--'}°C</span>
                    <span className="text-[9px] uppercase tracking-[1px]" style={{color: 'var(--text-tertiary)'}}>{locationName}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default WeatherWidget;
