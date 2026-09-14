#!/bin/bash
# MEGA-MD Heroku One-Click Deployer
# Usage: bash <(curl -s https://raw.githubusercontent.com/JUNAID-MD↣³⁰²Info/MEGA-MDX/main/lib/heroku.sh)

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—"
echo "â•‘       MEGA-MD Heroku Deployer         â•‘"
echo "â•‘         by JUNAID-MD↣³⁰²Info             â•‘"
echo "â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•"
echo -e "${NC}"

# Check dependencies
for cmd in git heroku; do
    if ! command -v $cmd &>/dev/null; then
        echo -e "${RED}âŒ '$cmd' not found. Please install it first.${NC}"
        [ "$cmd" = "heroku" ] && echo "Install: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
done

# Check login
if ! heroku auth:whoami &>/dev/null; then
    echo -e "${YELLOW}ðŸ”‘ Please login to Heroku:${NC}"
    heroku login
fi

echo ""
echo -e "${BOLD}ðŸ“‹ Enter your bot details:${NC}"
echo ""

# App name
read -p "$(echo -e ${CYAN}App name (e.g. my-mega-md): ${NC})" APP_NAME
APP_NAME=${APP_NAME:-mega-md-bot}

# Session ID
read -p "$(echo -e ${CYAN}Session ID (JUNAID-MD↣³⁰²Info/MEGA-MD_xxxxx): ${NC})" SESSION_ID
if [ -z "$SESSION_ID" ]; then
    echo -e "${RED}âŒ Session ID is required!${NC}"
    exit 1
fi

# Owner number
read -p "$(echo -e ${CYAN}Owner WhatsApp number (e.g. ): ${NC})" OWNER_NUMBER
OWNER_NUMBER=${OWNER_NUMBER:-}

# Bot name
read -p "$(echo -e ${CYAN}Bot name (default: MEGA-MD): ${NC})" BOT_NAME
BOT_NAME=${BOT_NAME:-MEGA-MD}

# MongoDB
read -p "$(echo -e ${CYAN}MongoDB URL (recommended, press Enter to skip): ${NC})" MONGO_URL

# Timezone
read -p "$(echo -e ${CYAN}Timezone (default: Asia/Karachi): ${NC})" TIMEZONE
TIMEZONE=${TIMEZONE:-Asia/Karachi}

echo ""
echo -e "${YELLOW}ðŸš€ Starting deployment...${NC}"
echo ""

# Clone if not in repo
if [ ! -f "heroku.yml" ]; then
    echo -e "${YELLOW}ðŸ“¦ Cloning MEGA-MD repo...${NC}"
    git clone https://github.com/JUNAID-MD↣³⁰²Info/MEGA-MDX mega-md-deploy
    cd mega-md-deploy
fi

# Create heroku app
echo -e "${YELLOW}ðŸ“± Creating Heroku app: ${APP_NAME}${NC}"
heroku create "$APP_NAME" 2>/dev/null || {
    echo -e "${YELLOW}âš ï¸ App name taken, trying ${APP_NAME}-$(date +%s | tail -c4)${NC}"
    APP_NAME="${APP_NAME}-$(date +%s | tail -c4)"
    heroku create "$APP_NAME"
}

# Set stack to container
echo -e "${YELLOW}ðŸ³ Setting container stack...${NC}"
heroku stack:set container -a "$APP_NAME"

# Set config vars
echo -e "${YELLOW}âš™ï¸ Setting environment variables...${NC}"
heroku config:set \
    SESSION_ID="$SESSION_ID" \
    OWNER_NUMBER="$OWNER_NUMBER" \
    BOT_NAME="$BOT_NAME" \
    TIMEZONE="$TIMEZONE" \
    COMMAND_MODE="public" \
    -a "$APP_NAME"

[ -n "$MONGO_URL" ] && heroku config:set MONGO_URL="$MONGO_URL" -a "$APP_NAME"

# Add heroku remote if not set
git remote get-url heroku &>/dev/null || heroku git:remote -a "$APP_NAME"

# Push
echo -e "${YELLOW}ðŸ“¤ Deploying to Heroku (this may take 3-5 minutes)...${NC}"
git push heroku main

# Scale
echo -e "${YELLOW}âš¡ Starting web dyno...${NC}"
heroku ps:scale web=1 -a "$APP_NAME"

echo ""
echo -e "${GREEN}â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—${NC}"
echo -e "${GREEN}â•‘        âœ… Deployment Complete!        â•‘${NC}"
echo -e "${GREEN}â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•${NC}"
echo ""
echo -e "${BOLD}App:${NC} https://${APP_NAME}.herokuapp.com"
echo -e "${BOLD}Logs:${NC} heroku logs --tail -a ${APP_NAME}"
echo -e "${BOLD}Stop:${NC} heroku ps:scale web=0 -a ${APP_NAME}"
echo ""
echo -e "${CYAN}ðŸ“± Scan QR or use Session ID to connect your WhatsApp!${NC}"
