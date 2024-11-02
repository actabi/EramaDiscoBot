import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || 'default_database_url';

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

export { sequelize };