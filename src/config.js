// config.js
require('dotenv').config();

module.exports = {
  DISCORD: {
    TOKEN: process.env.DISCORD_TOKEN,
    CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
    POLLING_INTERVAL: 5 * 60 * 1000, // 5 minutes
  },
//   NOTION: {
//     API_KEY: process.env.NOTION_API_KEY,
//     DATABASE_ID: process.env.NOTION_DATABASE_ID,
//   },
  POSTGRES: {
    USER: process.env.POSTGRES_USER,
    PASSWORD: process.env.POSTGRES_PASSWORD,
    DB: process.env.POSTGRES_DB,
    HOST: process.env.POSTGRES_HOST,
    PORT: process.env.POSTGRES_PORT,
  },
};
