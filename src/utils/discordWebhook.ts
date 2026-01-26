"use client";

// Logic ported from legacy discordWebhook.js with TypeScript enhancements

interface DeviceInfo {
    brand: string;
    os: string;
    device: string;
    browser: string;
    isVirtual: boolean;
    rawUA: string;
}

/**
 * Parses the User Agent string to get device, OS, and browser details.
 */
export const getDeviceInfo = (userAgent: string): DeviceInfo => {
    const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
    let os = "Unknown OS";
    let device = "Unknown Device";
    let browser = "Unknown Browser";
    let isVirtual = false;

    // Detect OS
    if (/Windows/.test(ua)) {
        os = "Windows";
        const winVer = /Windows NT (\d+\.\d+)/.exec(ua);
        if (winVer) os += ` ${winVer[1]}`;
    } else if (/Android/.test(ua)) {
        os = "Android";
        const androidVer = /Android\s([0-9.]+)/.exec(ua);
        if (androidVer) os += ` ${androidVer[1]}`;

        // Android Model parsing
        const modelMatch = /;\s?([^;]+?)\sBuild\//.exec(ua);
        if (modelMatch) {
            device = modelMatch[1];
        }
    } else if (/iPhone|iPad|iPod/.test(ua)) {
        os = "iOS";
        const iosVer = /OS\s([\d_]+)/.exec(ua);
        if (iosVer) os += ` ${iosVer[1].replace(/_/g, '.')}`;
        device = /iPhone/.test(ua) ? "iPhone" : (/iPad/.test(ua) ? "iPad" : "iPod");
    } else if (/Mac/.test(ua)) {
        os = "MacOS";
        if (/Mac OS X/.test(ua)) {
            const macVer = /Mac OS X\s([\d_]+)/.exec(ua);
            if (macVer) os += ` ${macVer[1].replace(/_/g, '.')}`;
        }
    } else if (/Linux/.test(ua)) {
        os = "Linux";
    }

    // Detect Virtual Machine / Emulator clues
    if (/Bluestacks/i.test(ua) || /BlueStacks/i.test(ua)) {
        isVirtual = true;
        device = "Bluestacks Emulator";
    } else if (/HeadlessChrome/.test(ua) || /Wget/.test(ua) || /curl/.test(ua)) {
        isVirtual = true;
        device = "Bot/Crawler";
    }

    // Detect Browser
    if (/Chrome/.test(ua) && !/Chromium/.test(ua) && !/Edge/.test(ua) && !/OPR/.test(ua)) {
        browser = "Chrome";
    } else if (/Firefox/.test(ua)) {
        browser = "Firefox";
    } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
        browser = "Safari";
    } else if (/Edge/.test(ua)) {
        browser = "Edge";
    }

    // Detect Brand
    let brand = "Generic/Unknown";

    if (os.includes("iOS") || os.includes("MacOS") || os.includes("Mac")) {
        brand = "Apple";
    } else if (device.includes("SM-") || device.includes("GT-") || /Samsung/i.test(ua)) {
        brand = "Samsung";
    } else if (/Pixel/i.test(device) || /Pixel/i.test(ua)) {
        brand = "Google Pixel";
    } else if (/Huawei/i.test(ua) || /Huawei/i.test(device)) {
        brand = "Huawei";
    } else if (/OPPO/i.test(ua)) {
        brand = "OPPO";
    } else if (/Vivo/i.test(ua)) {
        brand = "Vivo";
    } else if (/Xiaomi/i.test(ua) || /Redmi/i.test(ua)) {
        brand = "Xiaomi";
    } else if (/OnePlus/i.test(ua)) {
        brand = "OnePlus";
    } else if (/Sony/i.test(ua)) {
        brand = "Sony";
    } else if (os.includes("Windows")) {
        brand = "PC (Windows)";
    } else if (os.includes("Linux")) {
        brand = "PC (Linux)";
    }

    return {
        brand,
        os,
        device: device !== "Unknown Device" ? device : (os === "MacOS" ? "Mac" : "PC/Generic"),
        browser,
        isVirtual,
        rawUA: ua
    };
};

/**
 * Fetches IP-based Location (Fallback).
 */
const getIpLocation = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error("Failed to fetch IP");
        return await response.json();
    } catch (error) {
        return { ip: "Unknown", city: "Unknown", country_name: "Unknown" };
    }
};

interface ExactLocation {
    lat: number;
    lon: number;
    link: string;
}

/**
 * Attempts to get precise Browser Geolocation.
 */
const getExactLocation = (): Promise<ExactLocation | null> => {
    return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve({
                    lat: latitude,
                    lon: longitude,
                    link: `https://www.google.com/maps?q=${latitude},${longitude}`
                });
            },
            (error) => {
                console.warn("Geolocation denied or failed:", error);
                resolve(null);
            },
            { timeout: 5000 } // Wait max 5 seconds for GPS
        );
    });
};

/**
 * Sends a webhook to Discord.
 */
export const sendDiscordWebhook = async (type: 'success' | 'failure' | 'contact', data: any) => {
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.NEXT_PUBLIC_REACT_APP_DISCORD_WEBHOOK_URL;

    if (!WEBHOOK_URL) {
        console.warn("Discord Webhook URL not found.");
        return;
    }

    const deviceInfo = getDeviceInfo(typeof navigator !== 'undefined' ? navigator.userAgent : '');

    // START: Hybrid Location Logic
    const ipLocationPromise = getIpLocation();
    const exactLocationPromise = getExactLocation();

    // Wait for both (or timeout)
    const [ipLocation, exactLocation] = await Promise.all([ipLocationPromise, exactLocationPromise]);

    // Decide which to show
    let locationString = `${ipLocation.city}, ${ipLocation.country_name}`;
    let mapLink = "";

    if (exactLocation) {
        locationString = `🎯 Exact: ${exactLocation.lat.toFixed(4)}, ${exactLocation.lon.toFixed(4)}`;
        mapLink = `\n[📍 Open in Google Maps](${exactLocation.link})`;
    }

    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    let embed = {};

    if (type === 'success') {
        embed = {
            title: "🔐 New Admin Login Success",
            description: "มีผู้ดูแลระบบเข้าสู่ระบบสำเร็จ" + mapLink,
            color: 0x00ff00, // Green
            fields: [
                { name: "User", value: `${data.username} (ID: ${data.id})`, inline: true },
                { name: "Time", value: timestamp, inline: true },
                { name: "Location", value: locationString, inline: true },
                { name: "IP Address", value: `||${ipLocation.ip}||`, inline: true },
                { name: "Device Info", value: `**${deviceInfo.brand}** | ${deviceInfo.device}`, inline: false },
                { name: "OS / Browser", value: `${deviceInfo.os} / ${deviceInfo.browser}`, inline: true }
            ],
            footer: { text: "Security System" }
        };
    } else if (type === 'failure') {
        embed = {
            title: "⚠️ Admin Login FAILED",
            description: "มีความพยายามเข้าสู่ระบบแต่ **ล้มเหลว**" + mapLink,
            color: 0xff0000, // Red
            fields: [
                { name: "Reason", value: data.error || "Unknown Error" },
                { name: "User", value: data.user ? `${data.user.username} (${data.user.id})` : "Unknown (Not authenticated)", inline: true },
                { name: "Time", value: timestamp, inline: true },
                { name: "Location", value: locationString, inline: true },
                { name: "IP Address", value: `||${ipLocation.ip}||`, inline: true },
                { name: "Device Info", value: deviceInfo.isVirtual ? `⚠️ **FAKE DEVICE** (${deviceInfo.brand})` : `**${deviceInfo.brand}** | ${deviceInfo.device}`, inline: true },
                { name: "OS / Browser", value: `${deviceInfo.os} / ${deviceInfo.browser}`, inline: true },
                { name: "HWID / UA", value: `\`${deviceInfo.rawUA.substring(0, 100)}...\`` }
            ],
            footer: { text: "Security Alert System" }
        };
    } else if (type === 'contact') {
        embed = {
            title: "📩 New Contact Message",
            description: "มีข้อความใหม่จากหน้าเว็บไซต์",
            color: 0x0099ff, // Blue
            fields: [
                { name: "From", value: `${data.name} (${data.email})`, inline: false },
                { name: "Subject", value: data.subject, inline: false },
                { name: "Message", value: `\`\`\`${data.message}\`\`\``, inline: false },
                { name: "Time", value: timestamp, inline: true },
                { name: "Location", value: locationString, inline: true },
                { name: "IP (Sender)", value: `||${ipLocation.ip}||`, inline: true },
            ],
            footer: { text: "Contact Form System" }
        };
    }


    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "Portfolio Security",
                embeds: [embed]
            })
        });
    } catch (err) {
        console.error("Failed to send Discord webhook:", err);
    }
};
