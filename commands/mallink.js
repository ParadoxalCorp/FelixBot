const unirest = require("unirest");
const popura = require('popura');
const malClient = popura('Paradoxcorp', 'Fetyug88');
const fs = require("fs-extra");

exports.run = async(client, message) => {
    try {
        const userMessage = message; //Store the user message so there will be no conflict with Felix's one
        const set = userMessage.content.indexOf("-set");
        const remove = userMessage.content.indexOf("-remove");
        const current = userMessage.content.indexOf("-current");
        const userEntry = client.database.Data.users[0][userMessage.author.id];
        if ((set !== -1) && (remove === -1) && (current === -1)) {
            message.channel.send("Checking if the account exists...").then(async(message) => {
                if (userMessage.content.substr(set + 5) === "") {
                    return await message.channel.send(":x: You didnt entered any username");
                }
                const malUser = userMessage.content.substr(set + 5).trim();
                await malClient.getAnimeList(malUser)
                    .then(async function (res) {
                        if (!res.myinfo) {
                            return await message.edit(":x: User not found");
                        }
                        var malAccount = res.myinfo;
                        userEntry.malAccount = malAccount.user_name;
                        fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                            if (err) console.error(err)
                        });
                        return await message.edit(":white_check_mark: Okay, i linked the account **" + malAccount.user_name + "** (ID: " + malAccount.user_id + ") to your account");
                    }).catch(async function (err) { //Which makes a double catch, ye, i love catching errors
                        await message.edit(":x: User not found");
                    })
            })
        } else if ((remove !== -1) && (set === -1) && (current === -1)) {
            if (userEntry.malAccount === "") {
                return await message.channel.send(":x: There is not any MyAnimeList account linked to your Discord account");
            }
            try {
                userEntry.malAccount = "";
                fs.writeFile(client.dbPath, JSON.stringify(client.database), (err) => {
                    if (err) console.error(err)
                })
                return await message.channel.send(":white_check_mark: Okay! I unlinked the accounts");
            } catch (err) {
                await message.channel.send(":x: An error occured");
                var guild;
                var detailledError; //that stuff is to avoid undefined logs
                if (message.guild) {
                    guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
                } else {
                    guild = "DM"
                }
                if (err.stack) {
                    detailledError = err.stack;
                } else {
                    detailledError = "None";
                }
                console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
                return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server                
            }
        } else if ((current !== -1) && (set === -1) && (remove === -1)) {
            if (userEntry.malAccount === "") {
                return await message.channel.send(":x: There is not any MyAnimeList account linked to your Discord account");                
            }
            return await message.channel.send("The MyAnimeList account currently linked to your Discord account is **" + userEntry.malAccount + "**");
        }
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get("328847359100321792").send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["linkmal", "animelink"],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'mallink',
    parameters: '`-set`, `-remove`, `-current`',
    description: 'Link your MyAnimeList account to your Discord account',
    usage: 'mallink -set MyAnimeList username',
    category: 'utility',
    detailledUsage: 'Everytime a user will try to display your MAL profile by mentionning you, Felix will use the link to return your profile. Same for the animelist command. Especially useful when you dont have the same name on MaL than on Discord\n`f!mallink -remove` Will remove the link between your MAL account and your Discord account\n`f!mallink -current` Will display the current MAL account linked to your Discord account\n**Important Note**\nSadly, you\'ll have to relink your account everytime you change your nickname on MyAnimeList'
};
