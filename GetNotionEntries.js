const { Client } = require("@notionhq/client");
const { config } = require("dotenv");

config();

const apiKey = process.env.NOTION_API_KEY;
const pageId = "6ae3539ed9e1400db4ce65a0df452e8d";
const DATABASE_ID = "6ae3539ed9e1400db4ce65a0df452e8d";

const notion = new Client({ auth: apiKey });

/* Retourne toutes les entrées de la base de données des missions qui n'ont pas été coché comme publié sur discord */
async function getEntries() {
    const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
            property: "DiscordPublication", // le nom de votre colonne
            checkbox: {
                equals: false
            }
        },
        sorts: [{
            property: "Created Time", // Assurez-vous d'avoir une colonne "Created Time" ou ajustez en conséquence
            direction: "ascending"
        }]
    });

	//console.log("Entries from Notion:", response.results);

    return response.results;
}

/* 
Met à jour la ligne de la base de données pour coché la case publier sur discord et ajouter l'ID de l'embed 
mission = response.results[0] correspond au retour de la base de donnée de la fonction getEntries
embedId correspond à l'id embed de discord qui a été rajouté (cela afin eventuellement de le modifié 
*/
async function updateMessageId(mission, embedId) {
    try {
		//console.log("------> " + JSON.stringify(mission.properties.DiscordIdMessage, null, 2));
		const numericEmbedId = Number(embedId);  // Convert embedId to a number

        // Mettre à jour la page avec la nouvelle valeur de DiscordPublication et l'ID de l'embed
        await notion.pages.update({
            page_id: mission.id,
            properties: {
                "DiscordIdMessage": {
                    "type": "number",
                    "number": numericEmbedId
                },
                "DiscordPublication": {
                    "checkbox": true
                }
            }
        });

        console.log(`Updated mission with page ID ${pageId} and embed ID ${embedId}.`);
        return true; // Retourne true pour indiquer que la mise à jour a été réussie

    } catch (error) {
        console.error('Error updating Notion page with embed ID:', error);
        return false; // Retourne false pour indiquer qu'une erreur s'est produite
    }
}

module.exports = { getEntries, updateMessageId };