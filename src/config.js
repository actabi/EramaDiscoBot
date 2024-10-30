require('dotenv').config();

module.exports = {
    DISCORD: {
        TOKEN: process.env.DISCORD_TOKEN,
        CHANNEL_ID: "1165942547055652915",
        POLLING_INTERVAL: 5 * 60 * 1000, // 5 minutes
    },
    NOTION: {
        API_KEY: process.env.NOTION_API_KEY,
        DATABASE_ID: "6ae3539ed9e1400db4ce65a0df452e8d"
    }
};