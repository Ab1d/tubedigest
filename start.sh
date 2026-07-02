#!/bin/bash
#
# TubeDigest Local — Start Script
# Starts both backend and frontend in parallel
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/backend/.env"

echo ""
echo -e "${CYAN}🚀 Starting TubeDigest...${NC}"
echo ""

# Check for .env file
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠ backend/.env not found${NC}"
    echo "Creating minimal .env file..."
    echo "# Add optional legacy config here, or use the in-app settings" > "$ENV_FILE"
fi

# Check if legacy DeepSeek API key is configured (optional now)
if grep -q "DEEPSEEK_API_KEY=your-api-key" "$ENV_FILE" || grep -q "DEEPSEEK_API_KEY=$" "$ENV_FILE" 2>/dev/null; then
    echo -e "  ${YELLOW}⚠ No legacy API key in .env${NC}"
    echo -e "  ${CYAN}You can configure your AI provider in the app settings.${NC}"
else
    echo -e "  ${GREEN}✓${NC} Legacy environment config present"
fi
echo ""

# Load environment variables (ignore errors for empty values)
export $(grep -v '^#' "$ENV_FILE" | xargs) 2>/dev/null || true

# Check backend dependencies
cd "$SCRIPT_DIR/backend"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Backend dependencies missing. Installing...${NC}"
    npm install 2>&1 | tail -3
fi

echo -e "${BOLD}💼 Starting Backend (port 3001)...${NC}"
cd "$SCRIPT_DIR/backend"
node src/index.js &
BACKEND_PID=$!
echo -e "  ${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

echo ""

# Check frontend dependencies
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Frontend dependencies missing. Installing...${NC}"
    npm install 2>&1 | tail -3
fi

echo -e "${BOLD}🌐 Starting Frontend (port 5173)...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "  ${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"

echo ""
echo -e "${GREEN}╔═════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║${NC}  ${BOLD}🎉 TubeDigest is running!${NC}                            ${GREEN}║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║${NC}  📁 Frontend:  ${CYAN}http://localhost:5173${NC}              ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  ⚙️  Backend:   ${CYAN}http://localhost:3001${NC}              ${GREEN}║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║${NC}  Configure your AI provider in the app settings.    ${GREEN}║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║${NC}  Press ${YELLOW}Ctrl+C${NC} to stop both services              ${GREEN}║${NC}"
echo -e "${GREEN}╚═════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for both processes
trap "echo ''; echo -e '${YELLOW}😴 Stopping TubeDigest...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
