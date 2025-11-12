#!/bin/bash

# Micasa Setup and Launch Script
# This script will set up and launch the Micasa application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Micasa Setup & Launch Script         ║"
echo "║   Household Management Application     ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print colored messages
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi
print_info "Node.js version: $(node -v) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_info "npm version: $(npm -v) ✓"

# Step 1: Set up backend
print_step "Setting up backend..."
cd server

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_info "Creating .env file..."

    # Generate secure JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    cat > .env << EOF
PORT=5000
JWT_SECRET=$JWT_SECRET
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EOF
    print_info ".env file created with secure JWT secret ✓"
else
    print_info ".env file already exists ✓"
fi

# Install server dependencies
print_info "Installing server dependencies..."
npm install

# Create data directory if it doesn't exist
if [ ! -d data ]; then
    print_info "Creating data directory..."
    mkdir -p data
fi

print_info "Backend setup complete ✓"

# Step 2: Set up frontend
print_step "Setting up frontend..."
cd ../client

# Install client dependencies
print_info "Installing client dependencies..."
npm install

print_info "Frontend setup complete ✓"

# Step 3: Build frontend for production (optional)
read -p "$(echo -e ${YELLOW}Do you want to build the frontend for production? [y/N]:${NC} )" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Building frontend for production..."
    npm run build
    print_info "Frontend build complete ✓"
fi

# Return to root
cd ..

# Step 4: Launch the application
print_step "Launching Micasa..."

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Setup Complete!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Starting servers...${NC}"
echo ""
echo -e "${YELLOW}Backend will start on:${NC}  http://localhost:5000"
echo -e "${YELLOW}Frontend will start on:${NC} http://localhost:3000"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    print_info "Shutting down servers..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    wait $SERVER_PID $CLIENT_PID 2>/dev/null
    print_info "Servers stopped ✓"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend server in background
print_info "Starting backend server..."
cd server
npm start &
SERVER_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server in background
print_info "Starting frontend development server..."
cd ../client
npm run dev &
CLIENT_PID=$!

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Micasa is running!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo -e "  → Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "  → Backend:  ${YELLOW}http://localhost:5000${NC}"
echo -e "  → API Docs: ${YELLOW}http://localhost:5000/api/health${NC}"
echo ""
echo -e "${BLUE}Default credentials (create new user):${NC}"
echo -e "  → Go to http://localhost:3000/register"
echo ""
echo -e "${RED}Press Ctrl+C to stop${NC}"
echo ""

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
