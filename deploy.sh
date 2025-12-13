#!/bin/bash

# BurgerBoss Vercel Deployment Script

echo "🍔 Preparing BurgerBoss for Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the client
echo "📦 Building React client..."
cd client
npm install
npm run build
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your BurgerBoss app is now live on Vercel!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables in Vercel dashboard"
echo "2. Configure your database connection"
echo "3. Update CORS settings with your production URL"
echo "4. Test all functionality"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"