
const path = require('path');
const fs = require('fs');

// 1. Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3000;

// 2. Identify where we are
const currentDir = __dirname;
const standaloneServer = path.join(currentDir, '.next', 'standalone', 'server.js');

if (!fs.existsSync(standaloneServer)) {
    console.error('❌ CRITICAL ERROR: Standalone server not found at ' + standaloneServer);
    process.exit(1);
}

console.log('🚀 Healthy Tag Bridge Booting...');
console.log('📁 Root Dir:', currentDir);

// 3. Start the Next.js standalone server
// Next.js standalone server automatically looks for:
// - .next/static (relative to its own directory)
// - public (relative to its own directory)
// Since the real server is in .next/standalone/, we need to make sure 
// files are mirrored there OR we point to it.

require(standaloneServer);
