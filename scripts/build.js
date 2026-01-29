#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');

console.log('🔧 Cleaning .next directory...');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
}

console.log('📦 Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('🚀 Building Next.js...');
execSync('npx next build', { stdio: 'inherit' });

console.log('✅ Build complete!');
