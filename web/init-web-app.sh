#!/bin/bash
# init-web-app.sh

# Variables de couleur
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Initialisation de l'Application Web ===${NC}"

# Fonction de vérification
check_command() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# 1. Initialisation du projet frontend avec Vite
echo -e "\n${YELLOW}1. Création du projet frontend...${NC}"
npm create vite@latest client -- --template react-ts
check_command "Création du projet Vite"

# 2. Installation des dépendances frontend
echo -e "\n${YELLOW}2. Installation des dépendances frontend...${NC}"
cd client
npm install
npm install @tanstack/react-query axios tailwindcss postcss autoprefixer
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-tabs
npm install @headlessui/react @hookform/resolvers react-hook-form zod
npm install @tailwindcss/forms clsx tailwind-merge
check_command "Installation des dépendances frontend"

# 3. Configuration de Tailwind CSS
echo -e "\n${YELLOW}3. Configuration de Tailwind CSS...${NC}"
npx tailwindcss init -p
check_command "Initialisation de Tailwind"

# 4. Création de la structure des dossiers
echo -e "\n${YELLOW}4. Création de la structure des dossiers...${NC}"
mkdir -p src/{components/{common,admin,freelance},hooks,services,utils,pages,layouts,context}
check_command "Création de la structure des dossiers"

# 5. Configuration du backend
echo -e "\n${YELLOW}5. Configuration du backend...${NC}"
cd ..
mkdir -p server
cd server
npm init -y
npm install express cors helmet jsonwebtoken express-validator
npm install typescript ts-node @types/express @types/node -D
npm install discord.js @discordjs/rest discord-api-types
npm install dotenv pg @types/pg
check_command "Configuration du backend"

# 6. Configuration de TypeScript pour le backend
echo -e "\n${YELLOW}6. Configuration de TypeScript...${NC}"
cat << EOF > tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
check_command "Configuration de TypeScript"

# 7. Création des fichiers de configuration
echo -e "\n${YELLOW}7. Création des fichiers de configuration...${NC}"
cd ..

# Configuration de Vite
cat << EOF > client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
EOF

# Configuration de Tailwind
cat << EOF > client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
EOF

# Variables d'environnement client
cat << EOF > client/.env.example
VITE_API_URL=http://localhost:3001
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
EOF

# Variables d'environnement serveur
cat << EOF > server/.env.example
PORT=3001
NODE_ENV=development
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
JWT_SECRET=your_jwt_secret

# Base de données (utiliser les mêmes que le bot)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=missionsdb
POSTGRES_USER=botuser
POSTGRES_PASSWORD=your_password
EOF

cp client/.env.example client/.env
cp server/.env.example server/.env
check_command "Création des fichiers de configuration"

# 8. Ajout des scripts npm
echo -e "\n${YELLOW}8. Configuration des scripts npm...${NC}"
cd client
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"

cd ../server
npm pkg set scripts.dev="ts-node-dev --respawn --transpile-only src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"
check_command "Configuration des scripts npm"

echo -e "\n${GREEN}=== Installation terminée avec succès ===${NC}"
echo -e "${YELLOW}Pour démarrer le développement :${NC}"
echo "1. Configurez les variables d'environnement dans:"
echo "   - client/.env"
echo "   - server/.env"
echo ""
echo "2. Démarrez le frontend (dans /bot/web/client):"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "3. Démarrez le backend (dans /bot/web/server):"
echo "   cd server"
echo "   npm run dev"