
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = false;
const app = next({ dev, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;

        // Force Next.js to handle all requests, including static assets
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
