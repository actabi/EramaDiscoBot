const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const CHANNEL_ID = "1165942547055652915";
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log('Bot is ready!');

    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Some title')
            .setURL('https://discord.js.org/')
            .setDescription('Some description here')
            .setThumbnail('https://i.imgur.com/AfFp7pu.png')
            .addFields(
                { name: 'Regular field title', value: 'Some value here' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setImage('https://i.imgur.com/AfFp7pu.png')
            .setTimestamp()

        channel.send({ embeds: [exampleEmbed] });
    } else {
        console.log(`Channel with ID ${CHANNEL_ID} not found!`);
    }
});

client.login(token);
