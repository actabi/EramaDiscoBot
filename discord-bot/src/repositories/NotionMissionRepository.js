const { Client } = require("@notionhq/client");
const IMissionRepository = require('../interfaces/iMissionRepository');
const Mission = require('../models/Mission');
const config = require('../config');

/**
 * Repository pour gérer les missions dans Notion
 * @implements {IMissionRepository}
 */
class NotionMissionRepository extends IMissionRepository {
    constructor() {
        super();
        this.client = new Client({ auth: config.NOTION.API_KEY });
        this.database_id = config.NOTION.DATABASE_ID;
    }

    /**
     * Convertit une page Notion en objet Mission
     * @param {Object} notionPage - Page Notion brute
     * @returns {Mission} Instance de Mission
     * @private
     */
    convertNotionToMission(notionPage) {
        try {
            // Dans convertNotionToMission()
            const mission = new Mission({
                id: notionPage.id,
                title: notionPage.properties.Title?.title?.[0]?.text?.content || 'Sans titre',
                description: notionPage.properties.Description?.rich_text?.[0]?.text?.content || '',
                skills: notionPage.properties.Skills?.multi_select?.map(skill => skill.name) || [],
                experienceLevel: notionPage.properties.Experience_level?.rich_text?.[0]?.text?.content || '',
                duration: notionPage.properties.Duration?.rich_text?.[0]?.text?.content || '',
                location: notionPage.properties.Localisation?.select?.name || '',
                price: notionPage.properties.Price?.number || null,
                workType: notionPage.properties.Work?.select?.name || '',
                missionType: notionPage.properties.Type_of_?.select?.name || '',
                isPublished: notionPage.properties.DiscordPublication?.checkbox || false,
                discordMessageId: notionPage.properties.DiscordIdMessage?.number || null,
                createdAt: new Date(notionPage.created_time),
            });  

            // Valider la mission avant de la retourner
            const validation = mission.validate();
            if (!validation.isValid) {
                console.warn(`Mission ${mission.id} has validation errors:`, validation.errors);
            }

            return mission;
        } catch (error) {
            console.error('Error converting Notion page to Mission:', error);
            throw new Error(`Failed to convert Notion page ${notionPage.id}: ${error.message}`);
        }
    }

    /**
     * Récupère les missions non publiées avec pagination
     * @returns {Promise<Mission[]>} Liste des missions non publiées
     * @override
     */
    async getUnpublishedMissions() {
        try {
        let hasMore = true;
        let startCursor = undefined;
        const missions = [];
    
        while (hasMore) {
            const response = await this.client.databases.query({
            database_id: this.database_id,
            filter: {
                property: 'DiscordPublication',
                checkbox: { equals: false },
            },
            sorts: [{ property: 'Created Time', direction: 'ascending' }],
            start_cursor: startCursor,
            });
    
            missions.push(
            ...response.results
                .map(page => {
                try {
                    return this.convertNotionToMission(page);
                } catch (error) {
                    console.error(`Failed to convert page ${page.id}:`, error);
                    return null;
                }
                })
                .filter(mission => mission !== null)
            );
    
            hasMore = response.has_more;
            startCursor = response.next_cursor;
        }
    
        console.log(`Successfully converted ${missions.length} missions`);
        return missions;
        } catch (error) {
        console.error('Error fetching missions from Notion:', error);
        throw new Error(`Failed to fetch missions: ${error.message}`);
        }
    }
  
    /**
     * Vérifie la connexion à Notion
     * @returns {Promise<boolean>} État de la connexion
     */
    async testConnection() {
        try {
            await this.client.databases.retrieve({
                database_id: this.database_id
            });
            return true;
        } catch (error) {
            console.error('Failed to connect to Notion:', error);
            return false;
        }
    }
}

module.exports = NotionMissionRepository;