const fs = require("fs-extra");
const unirest = require("unirest");

module.exports = async (client, guild) => {
//const guild = guildCreate.channel.guild
    const owner = guild.members.find(m => m.id === guild.ownerID);
    const support = "https://discord.gg/6QkjVBk";
    owner.send({
        embed: {
            type: 'rich',
            description: 'About me',
            fields: [{
                name: '**General**',
                value: "Hey, im Felix, a multi-purposes bot. You can see all my commands using the `f!help` command",
                inline: true
			 }, {
                name: '**Updates**',
                value: "Want to get updated about new releases, bugs fixes, development and more? Use `f!updatechan -set` in a text channel to set this channel as a changelog channel, felix will send the changelogs in this channel",
                inline: true
			 }, {
                name: '**Support**',
                value: "If you need any help, just ask in the **#support** channel on the [support server](https://discord.gg/Ud49hQJ).",
                inline: true

		 }],
            footer: {
                text: 'about',
                proxy_icon_url: ' '
            },
            thumbnail: {
                url: guild.iconURL
            },
            color: 0xFF0000,
            timestamp: new Date(),
            footer: {
                text: '',
            },
            author: {
                name: client.user.username + "#" + client.user.discriminator,
                icon_url: " ",
                proxy_icon_url: ' '
            }
        }
    }).catch(console.error);
    try {
        if (!client.database.Data.servers[0][guild.id]) {
            client.database.Data.servers[0][guild.id] = {
                prefix: "f!",
                thingsLevel0: [],
                thingsLevel1: [],
                thingsLevel2: [],
                globalLevel: "none",
                updateChannel: "",
                onJoinRole: "",
                greetings: "",
                farewell: "",
                greetingsMethod: "",
                greetingsChan: "",
                farewellChan: ""
            }
            fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                if (err) console.error(err)
            });
        }
    } catch (err) {
        console.error(err);
        return await client.channels.get(client.errorLog).send(`A critical error occured while trying to create an entry for the guild ${guild.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
    }
    // Send the server count to Discord Bot list
    try {
        await unirest.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
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
        return client.channels.get(client.errorLog).send("``` A critical error occured while sending data to Discord Bot list \nTriggered error: " + err + "```");
    }
};