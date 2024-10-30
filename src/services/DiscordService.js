const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('../config');

class DiscordService {
    constructor() {
        this.client = new Client({ 
            intents: [
                GatewayIntentBits.Guilds, 
                GatewayIntentBits.GuildMessages
            ] 
        });
        this.isReady = false;
    }

    /**
     * Initialise la connexion Discord
     * @returns {Promise} Résolution quand le client est prêt
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            this.client.once('ready', () => {
                console.log('Discord bot is ready!');
                this.isReady = true;
                resolve();
            });

            this.client.on('error', error => {
                console.error('Discord error:', error);
                reject(error);
            });

            this.client.login(config.DISCORD.TOKEN).catch(reject);
        });
    }

    /**
     * Crée un embed Discord à partir d'un objet Mission
     * @param {Mission} mission - L'objet Mission à convertir en embed
     * @returns {EmbedBuilder} L'embed Discord créé
     */
    createMissionEmbed(mission) {
        const embed = new EmbedBuilder()
            .setColor("#00b0f4")
            .setTitle(mission.title || 'Sans titre');

        // Description de la mission
        if (mission.description) {
            embed.addFields({
                name: "🚀 Mission:",
                value: mission.description,
                inline: false
            });
        }

        // Compétences requises
        embed.addFields({
            name: "🛠️ Compétences",
            value: mission.skills.length > 0 ? mission.skills.join(', ') : 'Non spécifié',
            inline: true
        });

        // Niveau d'expérience
        embed.addFields({
            name: "🧠 Experience Level",
            value: mission.experienceLevel || 'Non spécifié',
            inline: true
        });

        // Durée
        embed.addFields({
            name: "⏳ Duration",
            value: mission.duration || 'Non spécifié',
            inline: true
        });

        // Localisation
        embed.addFields({
            name: "📍 Location:",
            value: mission.location || 'Non spécifié',
            inline: false
        });

        // Prix
        embed.addFields({
            name: "💰 Price:",
            value: mission.price ? `${mission.price}€` : 'Non spécifié',
            inline: true
        });

        // Type de travail
        embed.addFields({
            name: "🏢 Travail:",
            value: mission.workType || 'Non spécifié',
            inline: true
        });

        // Type de mission
        embed.addFields({
            name: "⏳ Type de mission:",
            value: mission.missionType || 'Non spécifié',
            inline: true
        });

        // Date de création
        embed.setFooter({
            text: `📅 Publié le: ${mission.createdAt.toLocaleDateString('fr-FR')} | ID: ${mission.id}`
        });

        return embed;
    }

    /**
     * Envoie une mission sur Discord
     * @param {Mission} mission - L'objet Mission à envoyer
     * @returns {Promise<string>} L'ID du message envoyé
     */
    async sendMission(mission) {
        if (!this.isReady) {
            throw new Error('Discord client not ready');
        }

        try {
            const channel = this.client.channels.cache.get(config.DISCORD.CHANNEL_ID);
            if (!channel) {
                throw new Error(`Channel ${config.DISCORD.CHANNEL_ID} not found`);
            }

            const embed = this.createMissionEmbed(mission);
            const message = await channel.send({ embeds: [embed] });

            // Création du thread de discussion
            const threadName = `Discussion - ${mission.title || 'Mission'}`
                .substring(0, 100); // Discord limite les noms de thread à 100 caractères

            await message.startThread({
                name: threadName,
                autoArchiveDuration: 10080, // 7 jours
                reason: `Thread créé pour la mission: ${mission.id}`
            });

            console.log(`Mission sent successfully. Message ID: ${message.id}`);
            return message.id;

        } catch (error) {
            console.error('Error sending mission to Discord:', error);
            throw error;
        }
    }

    /**
     * Met à jour un message existant sur Discord
     * @param {string} messageId - L'ID du message à mettre à jour
     * @param {Mission} mission - La mission mise à jour
     * @returns {Promise<boolean>} True si la mise à jour est réussie
     */
    async updateMissionMessage(messageId, mission) {
        if (!this.isReady) {
            throw new Error('Discord client not ready');
        }

        try {
            const channel = this.client.channels.cache.get(config.DISCORD.CHANNEL_ID);
            if (!channel) {
                throw new Error(`Channel ${config.DISCORD.CHANNEL_ID} not found`);
            }

            const message = await channel.messages.fetch(messageId);
            if (!message) {
                throw new Error(`Message ${messageId} not found`);
            }

            const embed = this.createMissionEmbed(mission);
            await message.edit({ embeds: [embed] });

            console.log(`Mission ${mission.id} updated successfully on Discord`);
            return true;

        } catch (error) {
            console.error('Error updating mission on Discord:', error);
            throw error;
        }
    }

    /**
     * Arrête proprement le client Discord
     */
    async shutdown() {
        if (this.isReady) {
            await this.client.destroy();
            this.isReady = false;
            console.log('Discord client shutdown complete');
        }
    }
}

module.exports = DiscordService;