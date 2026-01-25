
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// CONFIGURATION
const PORT = 4000;
const VERCEL_URL = 'https://healthy-tag-59ap.vercel.app'; // Your Vercel App

app.get('/', (req, res) => {
    res.send('Healthy Tag Bridge is Running!');
});

// The device sends data here
app.post('/', async (req, res) => {
    console.log('---------------------------------');
    console.log('📥 Received data from Device:');
    console.log(req.body);

    const deviceId = req.body.deviceId || 'HT-DZ-00034';

    // Construct the Vercel API URL
    const targetUrl = `${VERCEL_URL}/api/devices/${deviceId}/readings`;

    try {
        console.log(`📤 Forwarding to Vercel: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('✅ Vercel Response:', data);

        // Reply to Device
        res.json({ success: true, forwarded: true });

    } catch (error) {
        console.error('❌ Error forwarding to Vercel:', error.message);
        res.status(500).json({ error: 'Bridge failed to forward' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🌉 BRIDGE STARTED! Listening on port ${PORT}`);
    console.log(`Waiting for LocalTunnel URL...`);
});
