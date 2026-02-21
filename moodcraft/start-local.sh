#!/bin/bash

# CereBro Local Development Startup Script (No Docker)
# Uses UV for Python package management

set -e

echo "🧠 Starting CereBro locally..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

echo -e "${BLUE}Checking prerequisites...${NC}"
check_command "uv"
check_command "node"
check_command "psql"
check_command "redis-cli"

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null || {
        echo "Please start PostgreSQL manually"
    }
    sleep 2
fi

# Check if Redis is running
if ! redis-cli ping &>/dev/null; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    brew services start redis 2>/dev/null || {
        echo "Please start Redis manually"
    }
    sleep 1
fi

# Create database if it doesn't exist
echo -e "${BLUE}Setting up database...${NC}"
createdb cerebro 2>/dev/null || echo "Database 'cerebro' already exists"

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start NLP Service in background
echo -e "${BLUE}Starting NLP Service with UV...${NC}"
cd "$SCRIPT_DIR/apps/nlp-service"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv
fi

source .venv/bin/activate
uv pip install -r requirements.txt --quiet

# Export environment variables for NLP service
export OPENAI_API_KEY="${OPENAI_API_KEY:-$(grep OPENAI_API_KEY $SCRIPT_DIR/.env | cut -d '=' -f2)}"
export DATABASE_URL="postgresql://$USER@localhost:5432/cerebro"
export REDIS_URL="redis://localhost:6379"

# Start NLP service in background
uvicorn main:app --host 0.0.0.0 --port 8000 &
NLP_PID=$!
echo -e "${GREEN}✓ NLP Service started (PID: $NLP_PID)${NC}"

# Wait for NLP service to be ready
sleep 3

# Start Web App
echo -e "${BLUE}Starting Web App...${NC}"
cd "$SCRIPT_DIR/apps/web"

# Update .env.local for local development
cat > .env.local << EOF
DATABASE_URL="postgresql://$USER@localhost:5432/cerebro"
REDIS_URL="redis://localhost:6379"
NLP_SERVICE_URL="http://localhost:8000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cerebro-local-dev-secret-change-in-production"
EOF

# Run migrations if needed
npx prisma generate
npx prisma migrate deploy 2>/dev/null || npx prisma db push

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🧠 CereBro is starting!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Web App:${NC}      http://localhost:3000"
echo -e "  ${BLUE}NLP Service:${NC}  http://localhost:8000"
echo -e "  ${BLUE}PostgreSQL:${NC}   localhost:5432/cerebro"
echo -e "  ${BLUE}Redis:${NC}        localhost:6379"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $NLP_PID 2>/dev/null
    echo -e "${GREEN}✓ All services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Next.js (foreground)
npm run dev

# Cleanup on exit
cleanup
