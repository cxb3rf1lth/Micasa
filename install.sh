#!/usr/bin/env bash

###############################################################################
# Micasa - Automated Installation Script
# This script automates the complete installation and setup of Micasa
###############################################################################

set -e  # Exit on any error

echo ""
echo "=========================================="
echo "  🏠 Micasa Installation v1.0.0"
echo "  Household Management for Couples"
echo "=========================================="
echo ""

###############################################################################
# Check Prerequisites
###############################################################################

echo "🔍 Checking prerequisites..."
echo ""

# Check Node.js
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

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    echo "   Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check git (optional)
if command -v git &> /dev/null; then
    echo "✅ Git version: $(git --version | cut -d' ' -f3)"
fi

echo ""
echo "✅ All prerequisites met!"
echo ""

###############################################################################
# Install Dependencies
###############################################################################

echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
echo ""

# Install root dependencies
echo "→ Installing root dependencies..."
npm install || {
    echo "❌ Failed to install root dependencies"
    exit 1
}

# Install server dependencies
echo "→ Installing server dependencies..."
cd server && npm install && cd .. || {
    echo "❌ Failed to install server dependencies"
    exit 1
}

# Install client dependencies
echo "→ Installing client dependencies..."
cd client && npm install && cd .. || {
    echo "❌ Failed to install client dependencies"
    exit 1
}

echo ""
echo "✅ All dependencies installed successfully!"
echo ""

###############################################################################
# Setup Environment
###############################################################################

echo "⚙️  Configuring environment..."
echo ""

# Server environment
if [ ! -f "server/.env" ]; then
    echo "→ Creating server environment file..."
    cp server/.env.example server/.env

    # Generate a strong JWT secret using openssl if available
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 48)
        # Escape special characters for sed
        JWT_SECRET_ESCAPED=$(echo "$JWT_SECRET" | sed 's/[&/\]/\\&/g')
        # Replace JWT_SECRET in .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET_ESCAPED|" server/.env
        else
            sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET_ESCAPED|" server/.env
        fi
        echo "✅ Server .env created with auto-generated JWT secret"
    else
        # Fallback to Node.js crypto
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")
        JWT_SECRET_ESCAPED=$(echo "$JWT_SECRET" | sed 's/[&/\]/\\&/g')
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET_ESCAPED|" server/.env
        else
            sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET_ESCAPED|" server/.env
        fi
        echo "✅ Server .env created with auto-generated JWT secret"
    fi
else
    echo "✅ Server .env already exists, skipping..."
fi

# Client environment
if [ ! -f "client/.env" ]; then
    echo "→ Creating client environment file..."
    cp client/.env.example client/.env
    echo "✅ Client .env created"
else
    echo "✅ Client .env already exists, skipping..."
fi

echo ""

###############################################################################
# Setup Database
###############################################################################

echo "🗄️  Setting up database..."
echo ""

# Create database directory
mkdir -p server/data
echo "✅ Database directory created"
echo "   Database will be automatically initialized on first server start"
echo ""

###############################################################################
# Complete Installation
###############################################################################

echo "=========================================="
echo "  🎉 Installation Complete!"
echo "=========================================="
echo ""
echo "Micasa is now ready to use!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Start the application:"
echo "   ${GREEN}Development mode (recommended):${NC}"
echo "   $ npm run dev"
echo ""
echo "   Production mode:"
echo "   $ npm start"
echo ""
echo "2. Open your browser:"
echo "   Client: http://localhost:3000"
echo "   Server API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "3. First-time setup:"
echo "   • Register a new account"
echo "   • Share your partner code with your partner"
echo "   • Your partner registers and links with your code"
echo "   • Start managing your household together!"
echo ""
echo "📚 DOCUMENTATION:"
echo "   • README.md - Full documentation"
echo "   • server/.env - Server configuration"
echo "   • client/.env - Client configuration"
echo ""
echo "💡 USEFUL COMMANDS:"
echo "   npm run dev          - Start in development mode (hot reload)"
echo "   npm start            - Start in production mode"
echo "   npm run server       - Start only the backend server"
echo "   npm run client       - Start only the frontend client"
echo "   npm run build:client - Build client for production"
echo ""
echo "🔒 SECURITY REMINDER:"
echo "   Before deploying to production:"
echo "   • Review server/.env configuration"
echo "   • Set NODE_ENV=production"
echo "   • Configure HTTPS/SSL"
echo "   • Update CLIENT_URL to your domain"
echo ""
echo "🏠 Happy household management!"
echo ""
