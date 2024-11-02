const { Pool } = require('pg');
const IMissionRepository = require('../interfaces/iMissionRepository');
const Mission = require('../models/Mission');

class PostgresMissionRepository extends IMissionRepository {
    constructor() {
        super();
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: process.env.POSTGRES_PORT,
        });

        // Test de connexion au démarrage
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    async getUnpublishedMissions() {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Récupérer les missions non publiées
            const missionsResult = await client.query(`
                SELECT m.*, array_agg(ms.skill) as skills
                FROM missions m
                LEFT JOIN mission_skills ms ON m.id = ms.mission_id
                WHERE m.is_published = FALSE
                GROUP BY m.id
                ORDER BY m.created_at ASC;
            `);

            await client.query('COMMIT');

            // Convertir les résultats en instances de Mission
            return missionsResult.rows.map(row => new Mission({
                id: row.id,
                title: row.title,
                description: row.description,
                skills: row.skills[0] ? row.skills : [],
                experienceLevel: row.experience_level,
                duration: row.duration,
                location: row.location,
                price: parseFloat(row.price),
                workType: row.work_type,
                missionType: row.mission_type,
                isPublished: row.is_published,
                discordMessageId: row.discord_message_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error fetching unpublished missions:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async updateMissionStatus(mission, discordMessageId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Mettre à jour le statut de la mission
            await client.query(`
                UPDATE missions
                SET is_published = TRUE,
                    discord_message_id = $1
                WHERE id = $2
            `, [discordMessageId, mission.id]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating mission status:', error);
            return false;
        } finally {
            client.release();
        }
    }

    async createMission(mission) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Insérer la mission
            const missionResult = await client.query(`
                INSERT INTO missions (
                    title, description, experience_level, duration,
                    location, price, work_type, mission_type
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [
                mission.title,
                mission.description,
                mission.experienceLevel,
                mission.duration,
                mission.location,
                mission.price,
                mission.workType,
                mission.missionType
            ]);

            // Insérer les compétences
            if (mission.skills && mission.skills.length > 0) {
                const skillValues = mission.skills.map(skill => 
                    `('${missionResult.rows[0].id}', '${skill}')`
                ).join(',');

                await client.query(`
                    INSERT INTO mission_skills (mission_id, skill)
                    VALUES ${skillValues}
                `);
            }

            await client.query('COMMIT');
            return missionResult.rows[0].id;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating mission:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async testConnection() {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
}

module.exports = PostgresMissionRepository;