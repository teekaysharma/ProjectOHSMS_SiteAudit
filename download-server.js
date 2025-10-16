#!/usr/bin/env node

// Simple download server for OHS Management System packages
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8888;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// MIME types
const MIME_TYPES = {
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
    '.tar.gz': 'application/gzip',
    '.tgz': 'application/gzip',
};

// Get MIME type
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

// Serve files
function serveFile(filePath, response) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('File not found');
        } else {
            const mimeType = getMimeType(filePath);
            response.writeHead(200, { 
                'Content-Type': mimeType,
                'Content-Length': data.length,
                'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
            });
            response.end(data);
        }
    });
}

// Create server
const server = http.createServer((request, response) => {
    // Add security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    
    let filePath = path.join(DOWNLOAD_DIR, request.url);
    
    // Remove leading slash
    if (filePath.startsWith(DOWNLOAD_DIR + path.sep)) {
        filePath = filePath.substring(DOWNLOAD_DIR.length + 1);
    }
    
    // If root, serve index.html
    if (request.url === '/' || request.url === '') {
        filePath = 'index.html';
    }
    
    const fullPath = path.join(DOWNLOAD_DIR, filePath);
    
    // Check if file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('File not found');
        } else {
            serveFile(fullPath, response);
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 OHS Management System Download Server`);
    console.log(`📦 Serving files from: ${DOWNLOAD_DIR}`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`\n📥 Available for download:`);
    console.log(`   • Complete Package: http://localhost:${PORT}/ohs-management-system-v2.5-complete.tar.gz`);
    console.log(`   • Production Package: http://localhost:${PORT}/ohs-management-system-v2.5-production.tar.gz`);
    console.log(`   • Download Page: http://localhost:${PORT}/`);
    console.log(`\n💡 Instructions:`);
    console.log(`   1. Open http://localhost:${PORT}/ in your browser`);
    console.log(`   2. Choose your preferred package`);
    console.log(`   3. Click the download button`);
    console.log(`   4. Save the file to your computer`);
    console.log(`\n🛑 Press Ctrl+C to stop the server\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping download server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Handle errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});