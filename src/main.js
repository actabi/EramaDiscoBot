const NotionMissionRepository = require('./repositories/NotionMissionRepository');
const MissionService = require('./services/MissionService');
const DiscordService = require('./services/DiscordService');

// Initialisation avec Notion
const missionRepository = new NotionMissionRepository();
const missionService = new MissionService(missionRepository);

class MissionBot {
    constructor(missionRepository) {
        this.missionService = new MissionService(missionRepository);
        this.discordService = new DiscordService();
    }

    async initialize() {
        try {
            await this.discordService.initialize();
            console.log('Bot initialized successfully');
        } catch (error) {
            console.error('Error initializing bot:', error);
            throw error;
        }
    }

    async processNewMissions() {
        try {
            const missions = await this.missionService.getUnpublishedMissions();
            
            if (missions.length === 0) {
                console.log('No new missions to publish');
                return;
            }

            console.log(`Found ${missions.length} new mission(s) to publish`);

            for (const mission of missions) {
                try {
                    console.log(`Processing mission: ${mission.id}`);
                    const messageId = await this.discordService.sendMission(mission);
                    if (messageId) {
                        await this.missionService.updateMissionStatus(mission, messageId);
                        console.log(`Successfully published mission: ${mission.id}`);
                    }
                } catch (error) {
                    console.error(`Error processing mission ${mission.id}:`, error);
                }
            }
        } catch (error) {
            console.error('Error in processNewMissions:', error);
        }
    }

    startPolling() {
        console.log('Starting mission polling...');
        this.processNewMissions();
        setInterval(() => this.processNewMissions(), config.DISCORD.POLLING_INTERVAL);
    }
}

// Utilisation avec Notion
const notionRepository = new NotionMissionRepository();
const bot = new MissionBot(notionRepository);

// Si on veut changer pour MongoDB plus tard
// const mongoRepository = new MongoMissionRepository(mongoConnection);
// const bot = new MissionBot(mongoRepository);

bot.initialize()
    .then(() => {
        console.log('Starting bot...');
        bot.startPolling();
    })
    .catch(error => {
        console.error('Failed to start bot:', error);
        process.exit(1);
    });