#!/bin/bash
# install-web-db.sh

# Variables de couleur
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Extension de la Base de Données pour l'Interface Web ===${NC}"

# 1. Chargement des variables d'environnement
echo -e "\n${YELLOW}1. Chargement de la configuration...${NC}"
if [ -f ../bot/.env ]; then
    export $(cat ../bot/.env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Fichier .env chargé${NC}"
else
    echo -e "${RED}✗ Fichier .env non trouvé dans ../bot/.env${NC}"
    exit 1
fi

# Fonction de vérification
check_command() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# 2. Vérification de la connexion
echo -e "\n${YELLOW}2. Vérification de la connexion à PostgreSQL...${NC}"
if PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; then
    echo -e "${GREEN}✓ Connexion réussie à PostgreSQL${NC}"
else
    echo -e "${RED}✗ Impossible de se connecter à PostgreSQL${NC}"
    echo -e "Détails de connexion utilisés:"
    echo -e "Host: $POSTGRES_HOST"
    echo -e "Port: $POSTGRES_PORT"
    echo -e "Database: $POSTGRES_DB"
    echo -e "User: $POSTGRES_USER"
    exit 1
fi

# 3. Sauvegarde de la base existante
echo -e "\n${YELLOW}3. Création d'une sauvegarde de sécurité...${NC}"
BACKUP_DIR="../postgresSql/backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup_before_web_extension_$(date +%Y%m%d_%H%M%S).sql"
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_FILE
check_command "Sauvegarde de la base de données"

# 4. Création du fichier SQL temporaire pour l'extension du schéma
echo -e "\n${YELLOW}4. Préparation du script d'extension...${NC}"
cat << 'EOF' > extend_schema.sql
-- Extension du schéma existant pour le support web
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
    ) THEN
        CREATE EXTENSION "uuid-ossp";
    END IF;
END
$$;

-- Table des utilisateurs Discord
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT unique_discord_id UNIQUE (discord_id)
);

-- Table des profils freelance
CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profession VARCHAR(255),
    experience_level VARCHAR(100),
    about TEXT,
    hourly_rate DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Table des compétences des freelances
CREATE TABLE IF NOT EXISTS freelancer_skills (
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    skill VARCHAR(100),
    PRIMARY KEY (freelancer_id, skill)
);

-- Table de liaison missions-freelances
CREATE TABLE IF NOT EXISTS mission_applications (
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (mission_id, freelancer_id),
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'))
);

-- Fonction de mise à jour des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_freelancer_profile_modtime ON freelancer_profiles;
CREATE TRIGGER update_freelancer_profile_modtime
    BEFORE UPDATE ON freelancer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mission_application_modtime ON mission_applications;
CREATE TRIGGER update_mission_application_modtime
    BEFORE UPDATE ON mission_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user ON freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_applications_status ON mission_applications(status);
CREATE INDEX IF NOT EXISTS idx_mission_applications_freelancer ON mission_applications(freelancer_id);

-- Vues pour faciliter les requêtes courantes
CREATE OR REPLACE VIEW view_freelancer_missions AS
SELECT 
    f.id AS freelancer_id,
    f.first_name,
    f.last_name,
    m.id AS mission_id,
    m.title AS mission_title,
    ma.status,
    ma.created_at AS application_date
FROM freelancer_profiles f
JOIN mission_applications ma ON f.id = ma.freelancer_id
JOIN missions m ON ma.mission_id = m.id;

CREATE OR REPLACE VIEW view_mission_stats AS
SELECT 
    m.id AS mission_id,
    m.title,
    COUNT(DISTINCT ma.freelancer_id) AS total_applications,
    SUM(CASE WHEN ma.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_applications,
    m.created_at,
    m.is_published
FROM missions m
LEFT JOIN mission_applications ma ON m.id = ma.mission_id
GROUP BY m.id, m.title;

-- Accorder les droits nécessaires au même utilisateur que le bot
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER;
EOF

# 5. Exécution du script d'extension
echo -e "\n${YELLOW}5. Extension du schéma de la base de données...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -f extend_schema.sql
check_command "Extension du schéma"

# 6. Ajout des interfaces et repositories
echo -e "\n${YELLOW}6. Création des fichiers TypeScript...${NC}"

# Création du dossier interfaces s'il n'existe pas
mkdir -p ../bot/src/interfaces

# Création de l'interface IFreelancerRepository
cat << 'EOF' > ../bot/src/interfaces/iFreelancerRepository.ts
interface IFreelancerRepository {
    createProfile(profile: any, userId: string): Promise<string>;
    applyToMission(freelancerId: string, missionId: string, message?: string): Promise<boolean>;
    getFreelancerMissions(freelancerId: string): Promise<any[]>;
    updateProfileStatus(profileId: string, status: string): Promise<any>;
    searchFreelancers(criteria: any): Promise<any[]>;
}

export default IFreelancerRepository;
EOF

# Création du repository
mkdir -p ../bot/src/database/repositories
cat << 'EOF' > ../bot/src/database/repositories/PostgresFreelancerRepository.ts
import { pool } from '../postgresql/connection';
import IFreelancerRepository from '../../interfaces/iFreelancerRepository';

class PostgresFreelancerRepository implements IFreelancerRepository {
    async createProfile(profile: any, userId: string): Promise<string> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const profileResult = await client.query(`
                INSERT INTO freelancer_profiles (
                    user_id, first_name, last_name, profession,
                    experience_level, about, hourly_rate
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [
                userId,
                profile.firstName,
                profile.lastName,
                profile.profession,
                profile.experienceLevel,
                profile.about,
                profile.hourlyRate
            ]);

            if (profile.skills?.length > 0) {
                const skillValues = profile.skills
                    .map((skill: string) => `('${profileResult.rows[0].id}', '${skill}')`)
                    .join(',');

                await client.query(`
                    INSERT INTO freelancer_skills (freelancer_id, skill)
                    VALUES ${skillValues}
                `);
            }

            await client.query('COMMIT');
            return profileResult.rows[0].id;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async applyToMission(freelancerId: string, missionId: string, message?: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                INSERT INTO mission_applications (
                    mission_id, freelancer_id, message
                ) VALUES ($1, $2, $3)
                ON CONFLICT (mission_id, freelancer_id) 
                DO UPDATE SET message = EXCLUDED.message
            `, [missionId, freelancerId, message]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            return false;
        } finally {
            client.release();
        }
    }

    async getFreelancerMissions(freelancerId: string): Promise<any[]> {
        const { rows } = await pool.query(`
            SELECT * FROM view_freelancer_missions
            WHERE freelancer_id = $1
            ORDER BY application_date DESC
        `, [freelancerId]);
        return rows;
    }

    async updateProfileStatus(profileId: string, status: string): Promise<any> {
        const { rows } = await pool.query(`
            UPDATE freelancer_profiles
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [profileId]);
        return rows[0];
    }

    async searchFreelancers(criteria: any): Promise<any[]> {
        const { rows } = await pool.query(`
            SELECT DISTINCT fp.*, 
                array_agg(fs.skill) as skills
            FROM freelancer_profiles fp
            LEFT JOIN freelancer_skills fs ON fp.id = fs.freelancer_id
            WHERE 
                ($1::text IS NULL OR fp.profession ILIKE $1)
                AND
                ($2::text[] IS NULL OR EXISTS (
                    SELECT 1 FROM freelancer_skills 
                    WHERE freelancer_id = fp.id 
                    AND skill = ANY($2)
                ))
            GROUP BY fp.id
        `, [
            criteria.profession ? `%${criteria.profession}%` : null,
            criteria.skills
        ]);
        return rows;
    }
}

export default PostgresFreelancerRepository;
EOF

check_command "Création des fichiers TypeScript"

# 7. Nettoyage
echo -e "\n${YELLOW}7. Nettoyage des fichiers temporaires...${NC}"
rm extend_schema.sql
check_command "Nettoyage"

echo -e "\n${GREEN}=== Installation terminée avec succès ===${NC}"
echo -e "${YELLOW}Actions effectuées :${NC}"
echo "1. Configuration chargée depuis ../bot/.env"
echo "2. Sauvegarde créée dans : $BACKUP_FILE"
echo "3. Nouvelles tables créées : users, freelancer_profiles, freelancer_skills, mission_applications"
echo "4. Vues créées : view_freelancer_missions, view_mission_stats"
echo "5. Interface et Repository TypeScript créés dans ../bot/src/"
echo -e "\n${YELLOW}Notes importantes :${NC}"
echo "- Une sauvegarde a été créée dans : $BACKUP_FILE"
echo "- En cas de problème, restaurez avec : PGPASSWORD=\$POSTGRES_PASSWORD psql -h \$POSTGRES_HOST -U \$POSTGRES_USER -d \$POSTGRES_DB < $BACKUP_FILE"
echo "- Les nouveaux fichiers TypeScript sont dans ../bot/src/"