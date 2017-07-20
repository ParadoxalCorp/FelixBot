const RapidAPI = new require('rapidapi-connect');
const rapid = new RapidAPI("felixbot_59661db7e4b02799980f840f", "2188b39b-de0a-456b-a1bd-92db06ed966f");
const unirest = require("unirest");

exports.run = async(client, message) => {
    try {
        const userMessage = message;
        const whitespace = userMessage.content.indexOf(" ");
        const userSearch = userMessage.content.indexOf("-getUser");
        const newsSearch = userMessage.content.indexOf("-getNews")
        if ((userSearch === -1) && (newsSearch !== -1)) {
            if (whitespace === -1) {
                return await message.channel.send(":x: You need to specify a game to search for !");
            }
            const game = userMessage.content.substr(newsSearch + 8).trim();
            await message.channel.send("Searching for informations...").then(async(message) => {
                await rapid.call('SteamWeb', 'getAppList', {
                    'version': 'v2'

                }).on('success', async(payload) => {
                    var success;
                    payload[0].applist.apps.forEach(async function (app) { //Why? In order to get the id of the game
                        try {
                            if (game === app.name) {
                                const appid = app.appid;
                                success = true; //will use it to check if the search did return a result
                                rapid.call('SteamWeb', 'getNewsForApp', {
                                    'appId': appid,
                                    'version': 'v2',
                                    'count': '1'

                                }).on('success', async(payload) => {
                                    const cleanHeaders = payload[0].appnews.newsitems[0].contents.replace(/(\[h1\]|\[\/h1\])/gim, "**"); //The following regexs replace will try to replace every tags by their markdown equivalents
                                    const cleanLists = cleanHeaders.replace(/(\[list\]|\[\/list\])/gim, "\n"); //Not very clean, will clean that later
                                    const cleanOpenListsItem = cleanLists.replace(/\[\*\]/gim, "-");
                                    const cleanCloseListsItem = cleanOpenListsItem.replace(/\[\/\*\]/gim, "\n");
                                    const cleanShietTags = cleanCloseListsItem.replace(/(\<p\>|\<\/p\>|\<a|\<\/a\>|\[|\]|&#8230|href=|\<em\>|\<\/em\>|\<img|src=|alt=""|\/\>)/gim, "");
                                    var cleanLinks = cleanShietTags.replace(/\/\%22\%3E/gim, "\" ");
                                    const timestamp = new Date(payload[0].appnews.newsitems[0].date * 1000);
                                    if (cleanLinks.length >= 1024) { //1024 is the embed limit
                                        cleanLinks = cleanLinks.substr(0, 1021) + "..";
                                    }
                                    return await message.edit({
                                        embed: {
                                            author: {
                                                name: `Announced at ${timestamp.toGMTString()}`,
                                                icon_url: message.author.avatarURL
                                            },
                                            title: `**${payload[0].appnews.newsitems[0].title}**`,
                                            description: `${cleanLinks}`,
                                            footer: {
                                                text: `${payload[0].appnews.newsitems[0].author}`
                                            }
                                        }
                                    }).catch(console.error);
                                    //`**${payload[0].appnews.newsitems[0].title}** -${timestamp.toGMTString()}\n${cleanLinks}\n*${payload[0].appnews.newsitems[0].author}*`
                                }).on('error', async (payload) => {
                                    await message.channel.send(":x: A server error occured");
                                    return console.error(payload);
                                });
                            }
                        } catch (err) {
                            return await message.channel.send(":x: An error occured");
                            console.error(err);
                        }
                    });
                    if (success !== true) {
                        return message.edit(":x: Your search didnt return any result");
                    }
                }).on('error', (payload) => {
                    console.log(payload);
                });
            });
        } else if ((userSearch !== -1) && (newsSearch === -1)) {
            const user = userMessage.content.substr(userSearch + 8).trim();
            fetch: {
                await unirest.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=C3218C2A10FFC18E3398BA5D66C4797B&vanityurl=${user}`)
                .end(async function (result) {
                    if (result.body.response.success === 42) {
                        return await message.channel.send(":x: Your search didnt return any result");
                    }
                    const userId = result.body.response.steamid;
                    return await message.channel.send(`http://badges.steamprofile.com/profile/default/steam/${userId}.png`); //Thans to PCGAMESN
                })
            }
        } else if ((userSearch === -1) && (newsSearch === -1)) {
            return await message.channel.send(":x: You didnt used any arguments");
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
    aliases: [],
    disabled: false,
    permLevel: 1
};

exports.help = {
    name: 'steam',
    parameters: '`-getNews`, `-getUser`',
    description: 'Search something through Steam',
    usage: 'steam -getNews GTA V',
    category: 'utility',
    detailledUsage: `\`{prefix}steam -getNews Rocket League\` Will return the latest community announcement of Rocket League, the game name must be the exact name\n\`{prefix}steam -getUser chucknorris\` Will return a fancy profile card of chucknorris`
};
