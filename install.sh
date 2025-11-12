#!/bin/bash

# Micasa Automated Installation Script
# This script fully automates the setup of Micasa with SQLite database

set -e  # Exit on error

echo ""
echo "=========================================="
echo "  🏠 Micasa Installation"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Please install Node.js v16 or higher from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required."
    echo "   Current version: $(node -v)"
    echo "   Please upgrade Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    echo "   Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
echo ""

npm run install:all

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to install dependencies."
    echo "   Please check your internet connection and try again."
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create .env file
echo "⚙️  Configuring environment..."

if [ ! -f "server/.env" ]; then
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Create .env file
    cat > server/.env << EOF
PORT=5000
JWT_SECRET=$JWT_SECRET
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EOF
    
    echo "✅ Environment configured with secure JWT secret"
else
    echo "✅ Environment file already exists"
fi

echo ""

# Create database directory
echo "🗄️  Initializing database..."
mkdir -p server/data
echo "✅ Database directory created"
echo ""

# Build the client
echo "🔨 Building client application..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to build client."
    exit 1
fi

echo ""
echo "✅ Client built successfully!"
echo ""
echo "=========================================="
echo "  🎉 Installation Complete!"
echo "=========================================="
echo ""
echo "Micasa is now ready to use!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start the application:"
echo "   Development mode:  npm run dev"
echo "   Production mode:   npm run preview"
echo ""
echo "2. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "3. Create your account and start managing your household!"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Overview and features"
echo "   - FEATURES.md - Detailed feature guide"
echo "   - DEPLOYMENT.md - Production deployment"
echo ""
echo "💡 Tips:"
echo "   - The SQLite database is stored in: server/data/micasa.db"
echo "   - No external database setup required!"
echo "   - All data is stored locally and securely"
echo ""
echo "Need help? Check the documentation or create an issue on GitHub!"
echo ""
