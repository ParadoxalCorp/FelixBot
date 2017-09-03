const unirest = require("unirest");

module.exports = async(client, message) => {
    if (client.maintenance && message.author.id !== client.database.Data.global[0].ownerId) return; //Ignore users during maintenance
    if (message.author.bot) return;
    if (client.userData.get(message.author.id)) {
        if ((client.userData.get(message.author.id).blackListed) && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users
    }
    client.defaultUserData = {
        id: message.author.id,
        cooldowns: {
            loveCooldown: 0,
            secondLoveCooldown: 0,
            feedbackCooldown: 0,
        },
        experience: {
            expCount: 34,
            level: 1,
            publicLevel: true
        },
        generalSettings: {
            lovePoints: 0,
            malAccount: "",
            blackListed: false,
            afk: "",
            reminders: [],
            points: 0
        }
    }
    const mentionned = message.mentions.users.first(); //--Afk feature--
    if (mentionned) {
        if (client.userData.get(mentionned.id)) {
            if (client.userData.get(mentionned.id).afk) {
                if (client.userData.get(mentionned.id).afk !== "") { //If the mentionned user hasnt set any afk status, do nothing
                    await message.channel.send({
                        embed: ({
                            color: 3447003,
                            author: {
                                name: mentionned.username + "#" + mentionned.discriminator + " is AFK",
                                icon_url: mentionned.avatarURL
                            },
                            description: client.userDatas.get(mentionned.id).afk
                        })
                    }).catch(console.error);
                }
            }
        } else {
            client.defaultUserData.id = mentionned.id; //To avoid errors in commands which works with mention, create a entry in case
            client.userData.set(mentionned.id, client.defaultUserData);
            client.defaultUserData.id = message.author.id;
        }
    }
    if (message.channel.type !== "dm") {
        try { //In case felix got invited while being down
            if (!client.guildData.get(message.guild.id)) {
                client.defaultGuildData = {
                    id: message.guild.id,
                    generalSettings: {
                        autoAssignablesRoles: [],
                        prefix: client.database.Data.global[0].prefix,
                        levelSystem: {
                            enabled: false,
                            public: false,
                            levelUpNotif: false,
                            roles: [],
                            users: [{
                                id: message.author.id,
                                expCount: 0,
                                level: 0
                            }],
                            totalExp: 0
                        }
                    },
                    permissionsLevels: {
                        things: [
                            [],
                            [],
                            []
                        ],
                        globalLevel: "none"
                    },
                    onEvent: {
                        onJoinRole: "",
                        greetings: "",
                        farewell: "",
                        greetingsMethod: "",
                        greetingsChan: "",
                        farewellChan: ""
                    }
                }
                client.guildData.set(message.guild.id, client.defaultGuildData);
            }
        } catch (err) {
            console.error(err);
            client.Raven.captureException(err);
        }
        const guildEntry = client.guildData.get(message.guild.id);
        if (message.content.startsWith(guildEntry.generalSettings.prefix + "t ")) {
            try {
                return require("../handlers/tagHandler.js")(client, message);
            } catch (err) {
                console.error(err);
                return client.Raven.captureException(err);
            }
        }
        require("../handlers/expHandler.js")(client, message);
        if (message.content.startsWith(`<@${client.user.id}>`) || message.content.startsWith(`<@!${client.user.id}>`)) { //Stuff like @Felix prefix            
            var args = message.content.split(/\s+/gim);
            args.shift();
            const request = args[0];
            if (request === "prefix") {
                return message.channel.send("The current prefix on this server is **" + guildEntry.generalSettings.prefix + "**");
            } else if (request === "help") {
                if (message.guild) {
                    return await message.channel.send("Here's the commands list, you can see the detailled help of a command using `" + guildEntry.generalSettings.prefix + "help commandname`\n\n" + client.overallHelp);
                } else {
                    return await message.channel.send("Here's the commands list, you can see the detailled help of a command using `" + client.database.Data.global[0].prefix + "help commandname`\n\n" + client.overallHelp);
                }
            }
        }
    }
    //Commands
    require("../handlers/commandHandler.js")(client, message);
}