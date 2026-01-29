#!/bin/bash
set -e

echo "🔧 Cleaning .next directory..."
rm -rf .next

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🚀 Building Next.js..."
npx next build

echo "✅ Build complete!"
