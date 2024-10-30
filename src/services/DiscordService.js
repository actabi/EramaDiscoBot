const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require('discord.js');
const config = require('../config');

/**
 * Service pour gérer les interactions avec Discord
 */
class DiscordService {
    constructor() {
        this.client = new Client({ 
            intents: [
                GatewayIntentBits.Guilds, 
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent  // Utile pour les futures fonctionnalités
            ] 
        });
        this.isReady = false;
        this.COLORS = {
            DEFAULT: "#00b0f4",
            ERROR: Colors.Red,
            SUCCESS: Colors.Green
        };
        this.setupEventHandlers();
    }

    /**
     * Configure les gestionnaires d'événements Discord
     * @private
     */
    setupEventHandlers() {
        this.client.on('warn', warning => {
            console.warn('Discord warning:', warning);
        });

        this.client.on('debug', info => {
            if (process.env.NODE_ENV === 'development') {
                console.debug('Discord debug:', info);
            }
        });

        // Gestion de la reconnexion
        this.client.on('disconnect', () => {
            console.log('Bot disconnected from Discord');
            this.isReady = false;
        });

        this.client.on('reconnecting', () => {
            console.log('Bot attempting to reconnect to Discord');
        });
    }

    /**
     * Initialise la connexion Discord
     * @returns {Promise} Résolution quand le client est prêt
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Discord connection timeout after 30 seconds'));
            }, 30000);

            this.client.once('ready', () => {
                clearTimeout(timeout);
                console.log(`Discord bot is ready! Logged in as ${this.client.user.tag}`);
                this.isReady = true;
                resolve();
            });

            this.client.on('error', error => {
                clearTimeout(timeout);
                console.error('Discord error:', error);
                reject(error);
            });

            this.client.login(config.DISCORD.TOKEN).catch(error => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    /**
     * Vérifie l'état de la connexion
     * @throws {Error} Si le client n'est pas prêt
     * @private
     */
    checkConnection() {
        if (!this.isReady) {
            throw new Error('Discord client not ready');
        }
    }

    /**
     * Récupère un canal Discord
     * @param {string} channelId - ID du canal
     * @returns {Promise<TextChannel>} Le canal Discord
     * @private
     */
    async getChannel(channelId) {
        const channel = this.client.channels.cache.get(channelId);
        if (!channel) {
            throw new Error(`Channel ${channelId} not found`);
        }
        return channel;
    }

    /**
     * Crée un embed Discord à partir d'un objet Mission
     * @param {Mission} mission - L'objet Mission à convertir en embed
     * @returns {EmbedBuilder} L'embed Discord créé
     * @private
     */
    createMissionEmbed(mission) {
        // Validation basique
        if (!mission || !mission.id) {
            throw new Error('Invalid mission object');
        }

        const embed = new EmbedBuilder()
            .setColor(this.COLORS.DEFAULT)
            .setTitle(mission.title || 'Sans titre')
            .addFields(
                {
                    name: "🚀 Mission:",
                    value: mission.description || 'Non spécifié',
                    inline: false
                },
                {
                    name: "🛠️ Compétences",
                    value: mission.skills?.length > 0 ? mission.skills.join(', ') : 'Non spécifié',
                    inline: true
                },
                {
                    name: "🧠 Experience Level",
                    value: mission.experienceLevel || 'Non spécifié',
                    inline: true
                },
                {
                    name: "⏳ Duration",
                    value: mission.duration || 'Non spécifié',
                    inline: true
                },
                {
                    name: "📍 Location:",
                    value: mission.location || 'Non spécifié',
                    inline: false
                },
                {
                    name: "💰 Price:",
                    value: mission.price ? `${mission.price}€` : 'Non spécifié',
                    inline: true
                },
                {
                    name: "🏢 Travail:",
                    value: mission.workType || 'Non spécifié',
                    inline: true
                },
                {
                    name: "⏳ Type de mission:",
                    value: mission.missionType || 'Non spécifié',
                    inline: true
                }
            )
            .setFooter({
                text: `📅 Publié le: ${mission.createdAt.toLocaleDateString('fr-FR')} | ID: ${mission.id}`
            })
            .setTimestamp();

        return embed;
    }

    /**
     * Envoie une mission sur Discord
     * @param {Mission} mission - L'objet Mission à envoyer
     * @returns {Promise<string>} L'ID du message envoyé
     */
    async sendMission(mission) {
        try {
            this.checkConnection();
            const channel = await this.getChannel(config.DISCORD.CHANNEL_ID);

            const embed = this.createMissionEmbed(mission);
            const message = await channel.send({ embeds: [embed] });

            const threadName = `Discussion - ${mission.title || 'Mission'}`
                .substring(0, 100);

            await message.startThread({
                name: threadName,
                autoArchiveDuration: 10080,
                reason: `Thread créé pour la mission: ${mission.id}`
            });

            console.log(`Mission ${mission.id} sent successfully. Message ID: ${message.id}`);
            return message.id;

        } catch (error) {
            console.error(`Error sending mission ${mission?.id}:`, error);
            throw new Error(`Failed to send mission: ${error.message}`);
        }
    }

    /**
     * Met à jour un message existant sur Discord
     * @param {string} messageId - L'ID du message à mettre à jour
     * @param {Mission} mission - La mission mise à jour
     * @returns {Promise<boolean>} True si la mise à jour est réussie
     */
    async updateMissionMessage(messageId, mission) {
        try {
            this.checkConnection();
            const channel = await this.getChannel(config.DISCORD.CHANNEL_ID);

            const message = await channel.messages.fetch(messageId);
            const embed = this.createMissionEmbed(mission);
            await message.edit({ embeds: [embed] });

            console.log(`Mission ${mission.id} updated successfully on Discord`);
            return true;
        } catch (error) {
            console.error(`Error updating mission ${mission?.id}:`, error);
            throw new Error(`Failed to update mission: ${error.message}`);
        }
    }

    /**
     * Arrête proprement le client Discord
     * @returns {Promise<void>}
     */
    async shutdown() {
        try {
            if (this.isReady) {
                await this.client.destroy();
                this.isReady = false;
                console.log('Discord client shutdown complete');
            }
        } catch (error) {
            console.error('Error during shutdown:', error);
            throw error;
        }
    }
}

module.exports = DiscordService;