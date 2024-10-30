const { Client } = require("@notionhq/client");
const IMissionRepository = require('../interfaces/IMissionRepository');
const Mission = require('../models/Mission');
const config = require('../config');

class NotionMissionRepository extends IMissionRepository {
    constructor() {
        super();
        this.client = new Client({ auth: config.NOTION.API_KEY });
    }

    convertNotionToMission(notionPage) {
        return new Mission({
            id: notionPage.id,
            title: notionPage.properties.Title?.title[0]?.text?.content,
            description: notionPage.properties.Description?.rich_text[0]?.text?.content,
            skills: notionPage.properties.Skills?.multi_select.map(skill => skill.name) || [],
            experienceLevel: notionPage.properties.Experience_level?.rich_text[0]?.text?.content,
            duration: notionPage.properties.Duration?.rich_text[0]?.text?.content,
            location: notionPage.properties.Localisation?.select?.name,
            price: notionPage.properties.Price?.number,
            workType: notionPage.properties.Work?.select?.name,
            missionType: notionPage.properties.Type_of_?.select?.name,
            isPublished: notionPage.properties.DiscordPublication?.checkbox,
            discordMessageId: notionPage.properties.DiscordIdMessage?.number,
            createdAt: new Date(notionPage.created_time)
        });
    }

    async getUnpublishedMissions() {
        try {
            const response = await this.client.databases.query({
                database_id: config.NOTION.DATABASE_ID,
                filter: {
                    property: "DiscordPublication",
                    checkbox: { equals: false }
                },
                sorts: [{ property: "Created Time", direction: "ascending" }]
            });
            
            return response.results.map(page => this.convertNotionToMission(page));
        } catch (error) {
            console.error('Error fetching missions from Notion:', error);
            throw error;
        }
    }

    async updateMissionStatus(mission, discordMessageId) {
        try {
            await this.client.pages.update({
                page_id: mission.id,
                properties: {
                    "DiscordIdMessage": {
                        "type": "number",
                        "number": Number(discordMessageId)
                    },
                    "DiscordPublication": {
                        "checkbox": true
                    }
                }
            });
            return true;
        } catch (error) {
            console.error('Error updating mission status in Notion:', error);
            throw error;
        }
    }
}

module.exports = NotionMissionRepository;