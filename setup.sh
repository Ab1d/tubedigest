#!/bin/bash
#
# TubeDigest Local — One-Click Setup Script
# Sets up both backend and frontend for local operation
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔═════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                      ║${NC}"
echo -e "${CYAN}║${NC}  ${BOLD}📺  TubeDigest Local Setup${NC}                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${GRAY}YouTube Summarizer + Multi-Provider AI${NC}            ${CYAN}║${NC}"
echo -e "${CYAN}║                                                      ║${NC}"
echo -e "${CYAN}╚═════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==================== STEP 0: CHECK DEPENDENCIES ====================
echo -e "${BOLD}🔍 Checking dependencies...${NC}"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "  ${GREEN}✓${NC} Node.js $(node -v)"
    else
        echo -e "  ${RED}✗${NC} Node.js $(node -v) — ${YELLOW}Need v18+${NC}"
        echo "    Install from: https://nodejs.org"
        exit 1
    fi
else
    echo -e "  ${RED}✗${NC} Node.js not found — ${YELLOW}Install from https://nodejs.org${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} npm $(npm -v)"
else
    echo -e "  ${RED}✗${NC} npm not found"
    exit 1
fi
echo ""

# ==================== STEP 1: OPTIONAL LEGACY ENV ====================
echo -e "${BOLD}🔑 Step 1: Environment Configuration${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/backend/.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "  ${GREEN}✓${NC} backend/.env already exists"
else
    # Create minimal .env file (API keys can be configured via UI now)
    cat > "$ENV_FILE" << EOF
# Optional: Legacy DeepSeek API key (can also be configured in the app UI)
# DEEPSEEK_API_KEY=your-api-key-here

# Optional: Server port
# PORT=3001

# Optional: PostgreSQL Database URL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tubedigest
EOF
    echo -e "  ${GREEN}✓${NC} Created backend/.env"
fi
echo ""

# ==================== STEP 2: BACKEND SETUP ====================
echo -e "${BOLD}⚙️  Step 2: Backend Setup${NC}"
echo ""

cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
    echo "  Installing backend dependencies..."
    npm install 2>&1 | tail -3
    echo -e "  ${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "  ${GREEN}✓${NC} Backend dependencies already installed"
fi
echo ""

# ==================== STEP 3: FRONTEND SETUP ====================
echo -e "${BOLD}🌐 Step 3: Frontend Setup${NC}"
echo ""

cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "  Installing frontend dependencies..."
    npm install 2>&1 | tail -3
    echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"
fi
echo ""

# ==================== STEP 4: BUILD FRONTEND ====================
echo -e "${BOLD}📦 Step 4: Building Frontend${NC}"
echo ""

echo "  Building production bundle..."
npm run build 2>&1 | tail -5
echo -e "  ${GREEN}✓${NC} Frontend built successfully"
echo ""

# ==================== DONE ====================
echo -e "${GREEN}╔═════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║${NC}  ${BOLD}✅  Setup Complete!${NC}                                ${GREEN}║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║${NC}  To start TubeDigest, run:                          ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                      ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}     ${CYAN}bash start.sh${NC}                                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                      ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Then open the app and configure your AI provider   ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  in the settings (top-right gear icon).             ${GREEN}║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}╚═════════════════════════════════════════════════════════════════╝${NC}"
echo ""
