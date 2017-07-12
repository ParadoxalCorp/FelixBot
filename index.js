const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs-extra");
const unirest = require("unirest");
const dbPath = "";
const database = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
const {
    promisify
} = require('util');
const readdir = promisify(require("fs").readdir);

const mention = "<@291561064544600074>";
const config = database.Data.global[0];
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.database = database;
client.dbPath = dbPath;
const errorLog = "328847359100321792";

process.on('uncaughtException', (err) => {
    try {
        console.error(err);
        client.channels.get(errorLog).send("Uncaught Exception\n**Detailled log:** " + err.stack);
    } catch (err) {
        return;
    }
});
process.on("unhandledRejection", err => {
    try {
        console.error(err);
        client.channels.get(errorLog).send("**Unhandled Rejection\n**Detailled log:** " + err.stack);
    } catch (err) {
        return;
    }
});

//require node 8 or higher
(async function () {

    // Here we load commands into memory, as a collection, so they're accessible everywhere
    const files = await readdir('./commands/');
    console.log("log", `Loading a total of ${files.length} commands.`);
    files.forEach(f => {
        try {
            const props = require(`./commands/${f}`);
            console.log("log", `Loading Command: ${props.help.name}. 👌`);
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
        } catch (e) {
            console.log(`Unable to load command ${f}: ${e.stack}`);
        }
    });

    client.on('guildCreate', guild => {
        //const guild = guildCreate.channel.guild
        const owner = guild.members.find(m => m.id === guild.ownerID);
        const support = "https://discord.gg/6QkjVBk";
        owner.sendMessage({
            embed: {
                type: 'rich',
                description: 'About me',
                fields: [{
                    name: '**General**',
                    value: "Hey, im Felix, a multi-purposes bot. You can see all my commands using the `f!help` command",
                    inline: true
			 }, {
                    name: '**Updates**',
                    value: "Want to get updated about new releases, bugs fixes, development and more? Use `f!setUpdate` in a text channel to set this channel as a changelog channel, felix will send the changelogs in this channel",
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
            if (!database.Data.servers[0][guild.id]) {
                database.Data.servers[0][guild.id] = {
                    prefix: "p!",
                    thingsLevel0: [],
                    thingsLevel1: [],
                    thingsLevel2: [],
                    globalLevel: "none",
                    updateChannel: "",
                    onJoinRole: ""
                }
                fs.writeFile(dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
        } catch (err) {
            console.error(err);
            return client.channels.get("328847359100321792").send(`A critical error occured while trying to create an entry for the guild ${guild.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
        }
        /* Send the server count to Discord Bot list
                try { 
                    unirest.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
                        .header('Authorization', database.Data.global[0].discordBotList)
                        .send({
                            server_count: client.guilds.size
                        }) //Send the server count to discord bots list
                        .end(function (response) {
                            if (response.body.length > 1) {
                                console.error("An error occured while sending data to discord bot list \nTriggered error: " + response.body);                        
                                return client.channels.get(errorLog).send("```An error occured while sending data to discord bot list \nTriggered error: " + response.body);
                            }
                        });
                    return;
                } catch (err) {
                    console.error("A critical error occured while sending data to Discord Bot list \nTriggered error: " + err)
                    return client.channels.get(errorLog).send("``` A critical error occured while sending data to Discord Bot list \nTriggered error: " + err + "```");
                }*/
    });
    client.on('guildDelete', guild => {
        /* Send the server count to Discord Bot list
                try { 
                    unirest.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
                        .header('Authorization', database.Data.global[0].discordBotList)
                        .send({
                            server_count: client.guilds.size
                        }) //Send the server count to discord bots list
                        .end(function (response) {
                            if (response.body.length > 1) {
                                console.error("An error occured while sending data to discord bot list \nTriggered error: " + response.body);                        
                                return client.channels.get(errorLog).send("```An error occured while sending data to discord bot list \nTriggered error: " + response.body);
                            }
                        });
                    return;
                } catch (err) {
                    console.error("A critical error occured while sending data to Discord Bot list \nTriggered error: " + err)
                    return client.channels.get(errorLog).send("``` A critical error occured while sending data to Discord Bot list \nTriggered error: " + err + "```");
                }*/
    });
client.on('guildMemberAdd', member => {
    if (client.database.Data.servers[0][member.guild.id].onJoinRole === "") return;
    const role = member.guild.roles.get(client.database.Data.servers[0][member.guild.id].onJoinRole);
    try {
        member.addRole(role);
        return;
    } catch (err) {
        if (!member.roles.get(role)) {
            member.guild.owner.send("Hey ! Sorry for disturbing you, but im supposed to give a role to every new members. However, it seems that the role doesnt exist anymore. Again, sorry for disturbing you, just in case you didnt knew. You can remove that role from my database using `f!onjoinrole -remove`");
        }
    }
});

    client.on("ready", () => {
        const servers = client.guilds.array().map(g => g.name).join(',');
        console.log("--------------------------------------");
        console.log('[!]Connecting... \n[!]Please wait!');
        const status = "p!help for commands"
        client.user.setGame(status);
    });
    client.on("message", message => {
        if (message.channel.type !== "dm") {
            try { //In case felix got invited while being down
                if (!database.Data.servers[0][message.guild.id]) {
                    database.Data.servers[0][message.guild.id] = {
                        prefix: "p!",
                        thingsLevel0: [],
                        thingsLevel1: [],
                        thingsLevel2: [],
                        globalLevel: "none",
                        updateChannel: "",
                        onJoinRole: ""
                    }
                    fs.writeFile(dbPath, JSON.stringify(client.database), (err) => {
                        if (err) console.error(err)
                    });
                }
            } catch (err) {
                console.error(err);
                client.channels.get("328847359100321792").send(`A critical error occured while trying to create an entry for the guild ${message.guild.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
            }
        }
        try { //If the user is not in the db yet, add it in order to avoid any bugs later
            if (!database.Data.users[0][message.author.id]) {
                database.Data.users[0][message.author.id] = {
                    lovePoints: 0,
                    loveCooldown: 0,
                    malAccount: ""
                }
                fs.writeFile(dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                });
            }
        } catch (err) {
            console.error(err);
            client.channels.get("328847359100321792").send(`A critical error occured while trying to create an entry for the user ${message.author.name} in the db\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
        }
        if (message.author.bot) return;
        if (message.channel.type === "dm") {
            if (!message.content.startsWith(database.Data.global[0].prefix)) return;
            client.prefix = database.Data.global[0].prefix;
            // Someone once told me that it was the best way to define args
            const args = message.content.split(/\s+/g);
            const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
            var command;
            if (client.commands.get(supposedCommand)) { //first check if its the a main command name, if not, then check if its an alias
                command = client.commands.get(supposedCommand).help.name;
            } else if (client.commands.get(client.aliases.get(supposedCommand))) {
                command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
            }
            const commandFile = require(`./commands/${command}.js`);
            if (commandFile.conf.guildOnly) {
                return message.channel.send(":x: This command can only be used in a guild");
            }
            if (commandFile.conf.disabled !== false) {
                return message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
            }
            try {
                return commandFile.run(client, message, args);
            } catch (err) {
                console.error(err);
                return client.channels.get("328847359100321792").send(`A critical error occured while trying to run the command ${command}\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
            }
        }
        if (message.content.startsWith(mention + " prefix")) {
            return message.channel.send("The current prefix on this server is **" + database.Data.servers[0][message.guild.id].prefix + "**");
        }
        if (!message.content.startsWith(database.Data.servers[0][message.guild.id].prefix)) return;
        client.prefix = database.Data.servers[0][message.guild.id].prefix;
        // Someone once told me that it was the best way to define args
        const args = message.content.split(/\s+/g);
        const supposedCommand = args.shift().slice(client.prefix.length).toLowerCase();
        if ((!client.commands.get(supposedCommand)) && (!client.aliases.get(supposedCommand))) return; //Just return if the command is not found
        var command;
        if (client.commands.get(supposedCommand)) { //first check if its the a main command name, if not, then check if its an alias
            command = client.commands.get(supposedCommand).help.name;
        } else if (client.commands.get(client.aliases.get(supposedCommand))) {
            command = client.commands.get(client.aliases.get(supposedCommand)).help.name;
        }
        //const command = client.commands.get(supposedCommand).help.name || client.commands.get(client.aliases.get(supposedCommand)).help.name; //check the default command name or one of the aliases 
        const commandFile = require(`./commands/${command}.js`);
        if (commandFile.conf.disabled !== false) {
            return message.channel.send(":x: Sorry but this command is disabled for now\n**Reason:** " + commandFile.conf.disabled);
        }
        var usrLevel;
        var isAdmin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
        var hasLevel0 = database.Data.servers[0][message.guild.id].thingsLevel0;
        var hasLevel1 = database.Data.servers[0][message.guild.id].thingsLevel1;
        var hasLevel2 = database.Data.servers[0][message.guild.id].thingsLevel2;
        var hasLevel42 = config.thingsLevel42;
        var globalLvl = database.Data.servers[0][message.guild.id].globalLevel; //the server level
        var userId = message.author.id;
        //----global check----                     //The following checks are just to determine the user access level by using the execution order
        if (globalLvl !== "none") {
            var globalToNum = Number(globalLvl);
            usrLevel = globalToNum;
        }
        //-----channels check-----
        if (hasLevel0.indexOf(message.channel.id) !== -1) {
            usrLevel = 0;
        }
        if (hasLevel1.indexOf(message.channel.id) !== -1) {
            usrLevel = 1;
        }
        if (hasLevel2.indexOf(message.channel.id) !== -1) {
            usrLevel = 2;
        }
        //-----roles check-----
        var rolesInDb = [] //Array in case there are more than 1 role with level that the user has
        var highestRole = "none";
        for (var [key, value] of message.guild.members.get(message.author.id).roles) {
            if ((hasLevel0.indexOf(key) !== -1) || (hasLevel1.indexOf(key) !== -1) || (hasLevel2.indexOf(key) !== -1)) {
                rolesInDb.push(key);
            }
        }
        if (rolesInDb.length === 1) {
            highestRole = rolesInDb[0];
            if (hasLevel0.indexOf(rolesInDb[0]) !== -1) {
                usrLevel = 0;
            }
            if (hasLevel1.indexOf(rolesInDb[0]) !== -1) {
                usrLevel = 1;
            }
            if (hasLevel2.indexOf(rolesInDb[0]) !== -1) {
                usrLevel = 2;
            }
        } else if (rolesInDb.length > 1) { //If there are more than 1 role with level that the user has, compare and only keep the highest one
            var i;
            for (i = 0; i < rolesInDb.length; i++) {
                if (highestRole === "none") {
                    var compare = message.guild.roles.get(rolesInDb[i]).comparePositionTo(message.guild.roles.get(rolesInDb[i + 1]))
                    if (compare > 0) {
                        highestRole = rolesInDb[i];
                    } else {
                        highestRole = rolesInDb[i + 1];
                    }
                } else {
                    var compare = message.guild.roles.get(rolesInDb[i]).comparePositionTo(message.guild.roles.get(highestRole));
                    if (compare > 0) {
                        highestRole = rolesInDb[i];
                    }
                }
            }
            if (hasLevel0.indexOf(highestRole) !== -1) {
                usrLevel = 0;
            }
            if (hasLevel1.indexOf(highestRole) !== -1) {
                usrLevel = 1;
            }
            if (hasLevel2.indexOf(highestRole) !== -1) {
                usrLevel = 2;
            }
        }
        //-----users check-----
        if (hasLevel0.indexOf(userId) !== -1) {
            usrLevel = 0;
        }
        if (hasLevel1.indexOf(userId) !== -1) {
            usrLevel = 1;
        }
        if (hasLevel2.indexOf(userId) !== -1) {
            usrLevel = 2;
        }
        if (isAdmin) {
            usrLevel = 2;
        }
        if (hasLevel42.indexOf(userId) !== -1) {
            usrLevel = 42;
        }
        if ((!isAdmin) && (hasLevel0.indexOf(userId) === -1) && (hasLevel1.indexOf(userId) === -1) && (hasLevel2.indexOf(userId) === -1) && (hasLevel42.indexOf(userId) === -1) && (hasLevel0.indexOf(message.channel.id) === -1) && (hasLevel1.indexOf(message.channel.id) === -1) && (hasLevel2.indexOf(message.channel.id) === -1) && (globalLvl === "none") && (hasLevel0.indexOf(highestRole) === -1) && (hasLevel1.indexOf(highestRole) === -1) && (hasLevel2.indexOf(highestRole) === -1)) {
            usrLevel = 1; //If there is no level set for this user/channel/server/role, give the user the default level
        }
        if (usrLevel >= commandFile.conf.permLevel) { //If the user level is higher or equal to the requested command level, then run the command
            try {
                commandFile.run(client, message, args);
            } catch (err) {
                console.error(err);
                return client.channels.get("328847359100321792").send(`A critical error occured while trying to run the command ${command}\n**Triggered Error:** ${err}\n**Detailled Error:** ${err.stack}`)
            }
        } else {
            return message.channel.send(":x: You don't have the permission to use this command !");
        }
    });
    client.login(config.token);
}());
