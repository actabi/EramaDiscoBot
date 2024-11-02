import { Pool } from 'pg';
import IMissionRepository from '../interfaces/iMissionRepository';
import Mission from '../models/Mission';
import { pool } from '../config/postgresMissionRepository'; // Mettre à jour le chemin vers la connexion PostgreSQL

class PostgresMissionRepository implements IMissionRepository {
    async getUnpublishedMissions(): Promise<Mission[]> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const missionsResult = await client.query(`
                SELECT m.*, array_agg(ms.skill) as skills
                FROM missions m
                LEFT JOIN mission_skills ms ON m.id = ms.mission_id
                WHERE m.is_published = FALSE
                GROUP BY m.id
                ORDER BY m.created_at ASC;
            `);

            await client.query('COMMIT');

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

    async updateMissionStatus(mission: Mission, discordMessageId: string): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                UPDATE missions
                SET discord_message_id = $1, is_published = TRUE
                WHERE id = $2;
            `, [discordMessageId, mission.id]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating mission status:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export default PostgresMissionRepository;