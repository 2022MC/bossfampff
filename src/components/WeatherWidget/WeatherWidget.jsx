import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiSnow, WiFog } from 'react-icons/wi';
import './WeatherWidget.css';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('Bangkok');

    // Default to Bangkok
    const DEFAULT_LAT = 13.7563;
    const DEFAULT_LON = 100.5018;

    useEffect(() => {
        // Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                    // Reverse geocoding is hard without key, so we might just say "Local Weather" or approximate
                    // For now, let's just fetch weather. If we want city name, OpenMeteo has a geocoding API too but it's separate.
                    // Let's stick to simple "Local" if strictly using coords, or default Bangkok.
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

    const fetchWeather = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            if (!response.ok) throw new Error('Weather data fetch failed');
            const data = await response.json();
            setWeather(data.current_weather);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        // 0: Clear sky
        // 1, 2, 3: Mainly clear, partly cloudy, and overcast
        // 45, 48: Fog
        // 51, 53, 55: Drizzle
        // 61, 63, 65: Rain
        // 71, 73, 75: Snow
        // 95, 96, 99: Thunderstorm
        if (code === 0) return <WiDaySunny className="weather-icon sunny" />;
        if (code >= 1 && code <= 3) return <WiCloudy className="weather-icon cloudy" />;
        if (code === 45 || code === 48) return <WiFog className="weather-icon fog" />;
        if (code >= 51 && code <= 67) return <WiRain className="weather-icon rain" />;
        if (code >= 71 && code <= 77) return <WiSnow className="weather-icon snow" />;
        if (code >= 95) return <WiThunderstorm className="weather-icon storm" />;
        return <WiDaySunny className="weather-icon" />;
    };

    if (loading) return null; // Don't show anything while loading to avoid layout shift or ugly loading state
    if (error) return null;

    return (
        <motion.div
            className="weather-widget"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
        >
            <div className="weather-content">
                {getWeatherIcon(weather.weathercode)}
                <div className="weather-info">
                    <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
                    <span className="weather-location">{locationName}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default WeatherWidget;
