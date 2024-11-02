require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../postgresql/connection');

async function initializeDatabase() {
    try {
        // Lire le fichier schema.sql
        const schemaPath = path.join(__dirname, '../postgresql/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Exécuter le schéma
        const client = await pool.connect();
        try {
            // S'assurer que nous avons les droits sur le schéma public
            await client.query('CREATE SCHEMA IF NOT EXISTS public');
            await client.query('ALTER SCHEMA public OWNER TO botuser');
            
            console.log('Creating database schema...');
            // Exécuter les commandes du schema une par une
            const commands = schema.split(';').filter(cmd => cmd.trim());
            for (const command of commands) {
                if (command.trim()) {
                    await client.query(command);
                }
            }
            console.log('Database schema created successfully');
            
            // Vérifier que les tables sont créées
            const tables = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            console.log('Created tables:', tables.rows.map(row => row.table_name));

        } finally {
            client.release();
        }

        // Tester la connexion
        const testQuery = await pool.query('SELECT NOW()');
        console.log('Database connection test successful:', testQuery.rows[0].now);

    } catch (error) {
        console.error('Error initializing database:', error);
        console.error('Full error:', error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initializeDatabase();