const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const CHANNEL_ID = "1165942547055652915";
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

function startBot() {
    return new Promise((resolve, reject) => {
        client.once('ready', () => {
            console.log('Bot is ready!');
            resolve();
        });

        client.on('error', error => {
            console.error('Error encountered:', error);
            reject(error);
        });

        client.login(token).catch(error => {
            console.error('Error during login:', error);
            reject(error);
        });
    });
}


function convertMissionToEmbed(props)
{
	let missionDetail = ".";
	let skillsDetail = ".";
	
	const eEmbed = new EmbedBuilder() 
		.setColor(0x0099FF)

	console.log(JSON.stringify(props, null, 2));

	if (props.properties && props.properties.Title && props.properties.Title.title && props.properties.Title.title[0] && props.properties.Title.title[0].text) {
		eEmbed.setTitle(props.properties.Title.title[0].text.content);
	}

    if (props.properties && props.properties.Description && props.properties.Description.rich_text && props.properties.Description.rich_text[0] && props.properties.Description.rich_text[0].text) {
        missionDetail = props.properties.Description.rich_text[0].text.content;
    }

	eEmbed.addFields(
		{
		  name: "🚀 Mission:",
		  value: missionDetail,
		  inline: false
		},
		{
		  name: "🛠️ Compétences",
		  value: skillsDetail,
		  inline: true
		},
		{
		  name: "🧠 Experience Level",
		  value: "Less than 2 years",
		  inline: true
		},
		{
		  name: "⏳ Duration",
		  value: "9 months",
		  inline: true
		},
		{
		  name: "📍 Location:",
		  value: "Aix-en-Provence, Provence-Alpes-Côte d'Azur",
		  inline: false
		},
		{
		  name: "💰 Price:",
		  value: "[Enter Price]",
		  inline: true
		},
		{
		  name: "🏢 Travail:",
		  value: "On-site/Hybrid/Remote",
		  inline: true
		},
		{
		  name: "⏳ Type of mission:",
		  value: "[Forfait/Regie]",
		  inline: true
		},
	  )
	  .setColor("#00b0f4")
	  .setFooter({
		  text: "📅 Posted: 24/10/2023 🔄 Updated: 28/10/2023"
	  });

    return eEmbed;
}

async function sendNewEmbed(embedData) {
    try {
		if (client.isReady()) {
			const channel = client.channels.cache.get(CHANNEL_ID);

			if (channel) {
				const sentMessage = await channel.send({ embeds: [embedData] });
				
                const thread = await sentMessage.startThread({
                    name: 'Discussion liée',  // Nom de la discussion
                    autoArchiveDuration: 10080,  // Auto-archive après 1 heure (peut être 60, 1440, 4320, 10080)
                });
				
				return sentMessage.id;
			} else {
				console.error(`Channel with ID ${CHANNEL_ID} not found.`);
				return null;
			}
		} else {
			console.error("Client is not ready yet!");
			return null;
		}
		
    } catch (error) {
        console.error('Error sending embed to Discord:', error);
		return null;
    }
}

async function updateEmbedInMessage(messageId) {
	updateEmbedInMessage(CHANNEL_ID, messageId);
}

/**
 * Met à jour l'embed d'un message spécifique dans un canal donné.
 * @param {TextChannel} channel - Le canal où se trouve le message.
 * @param {string} messageId - L'ID du message à mettre à jour.
 */
async function updateEmbedInMessage(channelId, messageId) {
  try {
	const channel = client.channels.cache.get(channelId);
    const targetMessage = await channel.messages.fetch(messageId);

    // Vérifie si le message a un embed avant de continuer
    if (!targetMessage.embeds.length) {
      console.error('Le message ne contient pas d\'embeds.');
      return;
    }

    const oldEmbed = targetMessage.embeds[0];
    const newEmbed = new MessageEmbed(oldEmbed)
      .setTitle('Titre mis à jour')
      .setDescription('Description mise à jour');

    await targetMessage.edit({ embeds: [newEmbed] });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'embed: ${error.message}`);
  }
}

module.exports = { sendNewEmbed, convertMissionToEmbed, startBot };


/*
const embed = new EmbedBuilder()
  .setAuthor({
    name: "Info",
    url: "https://example.com",
  })
  .setTitle("Développeur Java (H/F) | HAYS MEDIAS | Aix-en-Provence (13)")
  .setURL("https://example.com")
  .addFields(
    {
      name: "🚀 Mission:",
      value: "Join a multidisciplinary team working in agile scrum methodology (developers, testers, architects, designers, functional analysts, ergonomists) under the responsibility of the Development Manager. Your tasks concern the Business Application and technical components:\n   - Development of applications in Java.\n   - Realization of new business functions and application evolutions of an IA / Big Data platform.",
      inline: false
    },
    {
      name: "🛠️ Compétences",
      value: "Java 8      \nElasticSearch\nApache Spark\nHadoop",
      inline: true
    },
    {
      name: "🧠 Experience Level",
      value: "Less than 2 years\n**⏳ Duration:** \n9 months",
      inline: true
    },
    {
      name: "📍 Location:",
      value: "Aix-en-Provence, Provence-Alpes-Côte d'Azur",
      inline: false
    },
    {
      name: "💰 Price:",
      value: "[Enter Price]",
      inline: true
    },
    {
      name: "🏢 Travail:",
      value: "On-site/Hybrid/Remote",
      inline: true
    },
    {
      name: "⏳ Type of mission:",
      value: "[Forfait/Regie]",
      inline: true
    },
  )
  .setColor("#00b0f4")
  .setFooter({
    text: "📅 Posted: 24/10/2023 🔄 Updated: 28/10/2023",
  });

await message.reply({ embeds: [embed] });*/

/*
{
  "object": "page",
  "id": "1ef8e69a-7dbd-435d-bc7b-1ca31e22ba4b",
  "created_time": "2023-10-22T08:59:00.000Z",
  "last_edited_time": "2023-10-28T20:55:00.000Z",
  "created_by": {
    "object": "user",
    "id": "4ce57a79-b659-4682-85dc-7c1b84fc38dd"
  },
  "last_edited_by": {
    "object": "user",
    "id": "4ce57a79-b659-4682-85dc-7c1b84fc38dd"
  },
  "cover": null,
  "icon": null,
  "parent": {
    "type": "database_id",
    "database_id": "6ae3539e-d9e1-400d-b4ce-65a0df452e8d"
  },
  "archived": false,
  "properties": {
    "Created Time": {
      "id": "%3DLQF",
      "type": "created_time",
      "created_time": "2023-10-22T08:59:00.000Z"
    },
    "Price": {
      "id": "%3Dmx%7C",
      "type": "number",
      "number": 1700
    },
    "DiscordPublication": {
      "id": "%3Fp~V",
      "type": "checkbox",
      "checkbox": false
    },
    "Localisation": {
      "id": "Cute",
      "type": "select",
      "select": {
        "id": "IhFk",
        "name": "Aix-en-Provence Provence-Alpes-Côte d'Azur",
        "color": "default"
      }
    },
    "Work": {
      "id": "D%5DSd",
      "type": "select",
      "select": null
    },
    "Type of ": {
      "id": "H%3AGt",
      "type": "select",
      "select": {
        "id": "i|\\q",
        "name": "Forfait",
        "color": "blue"
      }
    },
    "Description": {
      "id": "HJ%40%7D",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Faire un assessment des équipes Audiovisuel, Videoconference, MysSite, IT Real 4 Estate afin d’optimiser les équipes",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Faire un assessment des équipes Audiovisuel, Videoconference, MysSite, IT Real 4 Estate afin d’optimiser les équipes",
          "href": null
        }
      ]
    },
    "Duration": {
      "id": "HYpY",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "9 mois",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "9 mois",
          "href": null
        }
      ]
    },
    "Mission status": {
      "id": "I%7B%3Cl",
      "type": "select",
      "select": {
        "id": "7286d828-2aed-4ddf-9d2d-288bcb4eb8fc",
        "name": "Done",
        "color": "brown"
      }
    },
    "DiscordIdMessage": {
      "id": "WqsD",
      "type": "number",
      "number": 1167929156529557500
    },
    "Attached documents": {
      "id": "XhYz",
      "type": "files",
      "files": []
    },
    "Client": {
      "id": "_~%3AN",
      "type": "relation",
      "relation": [],
      "has_more": false
    },
    "Notes": {
      "id": "bTXG",
      "type": "rich_text",
      "rich_text": []
    },
    "Responsible": {
      "id": "jf%3Dj",
      "type": "rich_text",
      "rich_text": []
    },
    "Submission Date": {
      "id": "oYT%3F",
      "type": "date",
      "date": null
    },
    "idMission": {
      "id": "ohCL",
      "type": "unique_id",
      "unique_id": {
        "prefix": null,
        "number": 2
      }
    },
    "Priority": {
      "id": "pNrd",
      "type": "select",
      "select": null
    },
    "Experience level": {
      "id": "r%5B%3B%5C",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "< 2 ans",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "< 2 ans",
          "href": null
        }
      ]
    },
    "Skills": {
      "id": "u%3BQo",
      "type": "multi_select",
      "multi_select": [
        {
          "id": "df47aa92-3aaf-46b4-8c2d-8745cd14907b",
          "name": "Java 8",
          "color": "pink"
        },
        {
          "id": "23555d73-4f5a-43ec-90f2-03369c6ad4ab",
          "name": "ElasticSearch",
          "color": "brown"
        },
        {
          "id": "4ddf7872-b285-4041-8374-a1954aefb600",
          "name": "Apache Spark",
          "color": "purple"
        },
        {
          "id": "8aea8cc9-97d3-4d62-a96f-f13e405aebee",
          "name": "Hadoop",
          "color": "blue"
        }
      ]
    },
    "Category": {
      "id": "%7C_%3FQ",
      "type": "multi_select",
      "multi_select": []
    },
    "Mission Deadline": {
      "id": "~c%3EQ",
      "type": "rich_text",
      "rich_text": []
    },
    "Title": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "Développeur Java (H/F) | HAYS MEDIAS | Aix-en-Provence (13)",
            "link": null
          },
          "annotations": {
            "bold": true,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Développeur Java (H/F) | HAYS MEDIAS | Aix-en-Provence (13)",
          "href": null
        }
      ]
    }
  },
  "url": "https://www.notion.so/D-veloppeur-Java-H-F-HAYS-MEDIAS-Aix-en-Provence-13-1ef8e69a7dbd435dbc7b1ca31e22ba4b",
  "public_url": null
}

*/