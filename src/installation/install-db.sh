#!/bin/bash
# install-db.sh

# Variables de couleur
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Installation de PostgreSQL ===${NC}"

# Fonction de vérification
check_command() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# 1. Installation de PostgreSQL
echo -e "\n${YELLOW}1. Installation de PostgreSQL...${NC}"
sudo apt update
sudo apt install -y postgresql postgresql-contrib
check_command "Installation de PostgreSQL"

# 2. Création du répertoire de données
echo -e "\n${YELLOW}2. Création du répertoire PostgreSQL...${NC}"
sudo mkdir -p /postgresSql/{data,backups}
sudo chown postgres:postgres /postgresSql -R
check_command "Création des répertoires"

# 3. Initialisation de la base de données
echo -e "\n${YELLOW}3. Configuration de PostgreSQL...${NC}"
sudo -u postgres createuser --createdb botuser
sudo -u postgres psql -c "ALTER USER botuser WITH PASSWORD 'U95IQ35';"
sudo -u postgres createdb -O botuser missionsdb
check_command "Configuration initiale de PostgreSQL"

# 4. Configuration des droits
echo -e "\n${YELLOW}4. Configuration des droits...${NC}"
sudo -u postgres psql -d missionsdb << EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL PRIVILEGES ON DATABASE missionsdb TO botuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO botuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO botuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO botuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO botuser;
EOF
check_command "Configuration des droits"

# 5. Création des tables
echo -e "\n${YELLOW}5. Création des tables...${NC}"
sudo -u postgres psql -d missionsdb << EOF
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    experience_level VARCHAR(100),
    duration VARCHAR(100),
    location VARCHAR(100),
    price DECIMAL,
    work_type VARCHAR(50),
    mission_type VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    discord_message_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mission_skills (
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    skill VARCHAR(100),
    PRIMARY KEY (mission_id, skill)
);

CREATE INDEX IF NOT EXISTS idx_missions_published ON missions(is_published);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at);
EOF
check_command "Création des tables"

# 6. Script de backup
echo -e "\n${YELLOW}6. Configuration du backup automatique...${NC}"
cat << 'EOF' | sudo tee /postgresSql/backup_script.sh
#!/bin/bash
BACKUP_DIR="/postgresSql/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE="missionsdb"

# Création de la sauvegarde
pg_dump -U postgres $DATABASE | gzip > $BACKUP_DIR/backup_${DATABASE}_${TIMESTAMP}.sql.gz

# Suppression des sauvegardes de plus de 7 jours
find $BACKUP_DIR -name "backup_${DATABASE}_*.sql.gz" -mtime +7 -delete
EOF

sudo chmod +x /postgresSql/backup_script.sh
check_command "Création du script de backup"

# 7. Configuration du CRON pour les backups
echo -e "\n${YELLOW}7. Configuration du CRON pour les backups...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /postgresSql/backup_script.sh") | crontab -
check_command "Configuration du CRON"

echo -e "\n${GREEN}=== Installation de la base de données terminée ===${NC}"
echo -e "${YELLOW}Actions requises :${NC}"
echo "1. Vérifier que PostgreSQL fonctionne : sudo systemctl status postgresql"
echo "2. Tester la connexion : psql -U botuser -d missionsdb -h localhost"
echo "3. Vérifier que les backups sont configurés : ls -l /postgresSql/backups"