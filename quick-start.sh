#!/bin/bash

# Micasa Quick Start Script
# This script helps you set up Micasa quickly

echo "🏠 Welcome to Micasa Setup!"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚙️  Creating .env file..."
    cp server/.env.example server/.env
    
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" server/.env
    else
        # Linux
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" server/.env
    fi
    
    echo "✅ Environment file created with secure JWT secret"
    echo ""
    echo "⚠️  Important: You need to set up MongoDB!"
    echo ""
    echo "   Option 1 (Recommended): MongoDB Atlas (Free Cloud Database)"
    echo "   1. Create account at https://www.mongodb.com/cloud/atlas"
    echo "   2. Create a cluster and get connection string"
    echo "   3. Edit server/.env and update MONGODB_URI"
    echo ""
    echo "   Option 2: Local MongoDB Installation"
    echo "   1. Install MongoDB from https://www.mongodb.com/try/download/community"
    echo "   2. Start MongoDB service"
    echo "   3. Use default URI: mongodb://localhost:27017/micasa"
    echo ""
else
    echo "✅ Environment file already exists"
    echo ""
fi

# Build the client
echo "🔨 Building client for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build client."
    exit 1
fi

echo ""
echo "✅ Client built successfully!"
echo ""
echo "======================================"
echo "🎉 Setup Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. Set up MongoDB (if not already done):"
echo "   - Edit server/.env and update MONGODB_URI"
echo ""
echo "2. Start the application:"
echo "   - Development: npm run dev"
echo "   - Production preview: npm run preview"
echo ""
echo "3. Open browser to http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Overview and quick start"
echo "   - PRODUCTION_SETUP.md - Production setup guide"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo "   - FEATURES.md - Feature documentation"
echo ""
echo "Need help? Check the documentation or create an issue on GitHub!"
echo ""
