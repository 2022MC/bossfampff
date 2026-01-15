const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
}

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
  console.log('⚠️  DISCORD_WEBHOOK_URL not set, skipping Discord notification');
  process.exit(0);
}

// Parse webhook URL
const url = new URL(webhookUrl);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

// Discord Embed message
const embed = {
  title: '🚀 Website Starting',
  description: 'Website is starting...',
  color: 0x667eea, // Purple color matching the theme
  timestamp: new Date().toISOString(),
  footer: {
    text: 'Portfolio Website'
  }
};

const payload = JSON.stringify({
  embeds: [embed]
});

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = client.request(options, (res) => {
  if (res.statusCode === 204 || res.statusCode === 200) {
    console.log('✅ Discord notification sent successfully');
  } else {
    console.log(`⚠️  Discord webhook returned status: ${res.statusCode}`);
  }
  res.on('data', () => {});
  res.on('end', () => {
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending Discord notification:', error.message);
  process.exit(0); // Don't fail the build if webhook fails
});

req.write(payload);
req.end();
