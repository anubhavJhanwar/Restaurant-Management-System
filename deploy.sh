#!/bin/bash

# BurgerBoss Deployment Script for Vercel

echo "🍔 BurgerBoss - Preparing for Vercel Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Build the client
echo "🔨 Building client application..."
cd client && npm run build && cd ..

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ Error: Client build failed. Please check for errors above."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "🚀 Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub: git add . && git commit -m 'Ready for deployment' && git push"
echo "2. Go to vercel.com and import your repository"
echo "3. Set environment variables (JWT_SECRET, NODE_ENV=production)"
echo "4. Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"