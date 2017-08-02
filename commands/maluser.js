const unirest = require('unirest');
const popura = require('popura');
const malClient = popura('Paradoxcorp', 'Fetyug88');
const malScraper = require('mal-scraper');

exports.run = async(client, message) => {
    try {
        const userEntry = client.userDatas.get(message.author.id),
            mentionned = message.mentions.users.first(),
            whitespace = message.content.indexOf(" ");
        var username;
        if (mentionned) {
            const mentionnedDatas = client.userDatas.get(mentionned.id);
            if (mentionnedDatas.malAccount === "") {
                return await message.channel.send(":x: The mentionned user hasn't any MyAnimeList account linked to their Discord account");
            } else {
                username = mentionnedDatas.malAccount;
            }
        } else {
            if (whitespace === -1) {
                return await message.channel.send(":x: You didnt specified any user to search");
            }
            username = message.content.substr(whitespace + 1).trim();
        }
        if (username === "") {
            return await message.channel.send(":x: You didnt specified any user to search");
        }
        const userMessage = message;
        await message.channel.send("Searching for the user **" + username + "**...").then(async(message) => {
            try {
                await malClient.getAnimeList(username)
                    .then(async function (res) {
                        var malUser = res.myinfo;
                        return await message.edit({
                            embed: {
                                title: "MyAnimeList",
                                url: "https://myanimelist.net/",
                                fields: [{
                                    name: ":bust_in_silhouette: Username",
                                    value: malUser.user_name,
                                    inline: true
                            }, {
                                    name: ":tv: Watching",
                                    value: malUser.user_watching.toString() + " anime(s)",
                                    inline: true
                            }, {
                                    name: ":white_check_mark: Completed",
                                    value: malUser.user_completed.toString() + " anime(s)",
                                    inline: true
                            }, {
                                    name: ":eyes: On hold",
                                    value: malUser.user_onhold.toString() + " anime(s)",
                                    inline: true
                            }, {
                                    name: ":x: Dropped",
                                    value: malUser.user_dropped.toString() + " anime(s)",
                                    inline: true
                            }, {
                                    name: ":notebook: Planned",
                                    value: malUser.user_plantowatch.toString() + " anime(s)",
                                    inline: true
                            }, {
                                    name: ":date: Days spent watching",
                                    value: malUser.user_days_spent_watching.toString(),
                                    inline: true
                            }, {
                                    name: ":link: Profile",
                                    value: `[${malUser.user_name}'s profile](https://myanimelist.net/profile/${malUser.user_name})`,
                                    inline: true
                            }],
                                timestamp: new Date()
                            }
                        }).catch(console.error);
                    }).catch(async function (err) {
                        await message.edit(":x: User not found");
                    });
            } catch(err) {
                console.error(err);
                return await message.channel.send(":x: An error occured");
            }
        });
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'maluser',
    description: 'Search for a user on MyAnimeList',
    usage: 'maluser username',
    category: 'utility',
};
