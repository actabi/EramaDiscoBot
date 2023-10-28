const { getEntries, updateMessageId } = require('./GetNotionEntries.js');
const { sendNewEmbed, convertMissionToEmbed, startBot } = require('./SendToDiscord.js'); 

const interval = 5 * 60 * 1000; // 5 minutes en millisecondes

async function main() {
    try {
        const newMissions = await getEntries();
        
        if (newMissions && newMissions.length > 0) {
            console.log(`Found ${newMissions.length} new mission(s). Sending to Discord...`);
            
            for (let mission of newMissions) {
                const embed = convertMissionToEmbed(mission); 
                const embedId = await sendNewEmbed(embed);
				if (embedId != null)
					updateMessageId(mission, embedId);
            }
        } else {
            console.log('No new missions found.');
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

startBot()
    .then(() => {
        // Appel initial à main()
        main();

        // Ensuite, exécutez main() toutes les 5 minutes
        setInterval(main, interval);
    })
    .catch(error => {
        console.error('Error starting the bot:', error);
    });


process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});