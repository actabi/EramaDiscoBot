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
            console.log('Creating database schema...');
            await client.query(schema);
            console.log('Database schema created successfully');
        } finally {
            client.release();
        }

        // Tester la connexion
        const testQuery = await pool.query('SELECT NOW()');
        console.log('Database connection test successful:', testQuery.rows[0].now);

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initializeDatabase();