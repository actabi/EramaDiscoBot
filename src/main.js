const config = require('./config');
const PostgresMissionRepository = require('./database/repositories/PostgresMissionRepository');
const MissionService = require('./services/MissionService');
const DiscordService = require('./services/DiscordService');

/**
 * Classe principale du bot
 */
class MissionBot {
  constructor() {
    const repository = new PostgresMissionRepository();
    this.missionService = new MissionService(repository);
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

// Initialisation
const bot = new MissionBot();

bot.initialize()
  .then(() => {
    console.log('Starting bot...');
    bot.startPolling();
  })
  .catch(error => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });