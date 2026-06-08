/**
 * Simple static file server to serve frontend files
 * Uses Node.js built-in modules (no external dependencies)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// MIME types mapping
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Remove leading slash and set default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Get file path
    let filePath = path.join(FRONTEND_DIR, pathname);

    // Ensure file is within FRONTEND_DIR (security)
    if (!filePath.startsWith(FRONTEND_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Check if file exists
    fs.stat(filePath, (err, stat) => {
        if (err) {
            // If file not found, try index.html for SPA routing
            if (err.code === 'ENOENT') {
                filePath = path.join(FRONTEND_DIR, 'index.html');
                fs.readFile(filePath, (readErr, content) => {
                    if (readErr) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 - File not found');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content);
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            }
            return;
        }

        // If it's a directory, serve index.html
        if (stat.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 - File not found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            });
            return;
        }

        // Serve the file
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'text/plain';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
    console.log(`Serving files from: ${FRONTEND_DIR}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
