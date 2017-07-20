const fs = require("fs-extra");
const unirest = require("unirest");

module.exports = async (client, guild) => {
    // Send the server count to Discord Bot list
    try {
        unirest.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
            .header('Authorization', client.database.Data.global[0].discordBotList)
            .send({
                server_count: client.guilds.size
            }) 
            .end(function (response) {
                if (response.body.length > 1) {
                    console.error("An error occured while sending data to discord bot list \nTriggered error: " + response.body);
                    return client.channels.get(client.errorLog).send("```An error occured while sending data to discord bot list \nTriggered error: " + response.body);
                }
            });
        return;
    } catch (err) {
        console.error("A critical error occured while sending data to Discord Bot list \nTriggered error: " + err)
        return await client.channels.get(client.errorLog).send("``` A critical error occured while sending data to Discord Bot list \nTriggered error: " + err + "```");
    }
};