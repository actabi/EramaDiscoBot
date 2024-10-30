#!/bin/bash
# install-bot.sh

# Variables de couleur pour une meilleure lisibilité
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Installation du Bot Discord ===${NC}"

# Fonction pour vérifier si une commande s'est bien exécutée
check_command() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# 1. Mise à jour du système
echo -e "\n${YELLOW}1. Mise à jour du système...${NC}"
sudo apt update && sudo apt upgrade -y
check_command "Mise à jour du système"

# 2. Installation de Node.js et npm
echo -e "\n${YELLOW}2. Installation de Node.js et npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
check_command "Installation de Node.js"

# 3. Installation de PM2
echo -e "\n${YELLOW}3. Installation de PM2...${NC}"
sudo npm install -g pm2
check_command "Installation de PM2"

# 4. Création de la structure du projet
echo -e "\n${YELLOW}4. Création de la structure du projet...${NC}"
mkdir -p ~/bot/src/{database/{postgresql,repositories,models,scripts},services,interfaces}
mkdir -p ~/bot/logs
check_command "Création de la structure des dossiers"

# 5. Installation des dépendances du projet
echo -e "\n${YELLOW}5. Installation des dépendances du projet...${NC}"
cd ~/bot
npm init -y
npm install discord.js dotenv pg

# Liste des fichiers requis
declare -A files_to_create
files_to_create=(
    ["ecosystem.config.js"]="module.exports = {
    apps: [{
        name: 'discord-bot',
        script: './src/main.js',
        watch: false,
        max_memory_restart: '200M',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        autorestart: true,
        restart_delay: 4000,
        max_restarts: 10
    }]
};"
    [".env.example"]="# Discord Configuration
DISCORD_TOKEN=your_token_here
DISCORD_CHANNEL_ID=your_channel_id_here

# PostgreSQL Configuration
POSTGRES_USER=botuser
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=missionsdb
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Environment
NODE_ENV=production"
    [".gitignore"]="node_modules/
.env
logs/
*.log
.DS_Store"
)

# Création des fichiers de base
echo -e "\n${YELLOW}6. Création des fichiers de configuration...${NC}"
for file in "${!files_to_create[@]}"; do
    echo "${files_to_create[$file]}" > "$file"
    check_command "Création de $file"
done

# Création du fichier .env
echo -e "\n${YELLOW}7. Configuration du fichier .env...${NC}"
cp .env.example .env
check_command "Création du fichier .env"
echo -e "${YELLOW}⚠️  N'oubliez pas de configurer vos variables d'environnement dans le fichier .env${NC}"

echo -e "\n${GREEN}=== Installation du bot terminée ===${NC}"
echo -e "${YELLOW}Actions requises :${NC}"
echo "1. Configurer le fichier .env avec vos identifiants"
echo "2. Installer la base de données PostgreSQL (utilisez install-db.sh)"
echo "3. Démarrer le bot avec : pm2 start ecosystem.config.js"