const eris = require("eris");
const logger = require("../modules/logger.js");

class StarboardManager {
    constructor(client) {
        this.client = client;
    }

    init() {
        const messages = new eris.Collection();
        logger.log(`Initialized StarboardManager`, `INFO`);
        this.client.on("messageReactionAdd", (message, emoji, userID) => {
            this.client.emit("messageReactionUpdate", message, emoji, userID);
        });
        this.client.on("messageReactionRemove", (message, emoji, userID) => {
            this.client.emit("messageReactionUpdate", message, emoji, userID);
        });
        this.client.on("messageReactionRemoveAll", message => {
            this.client.emit("messageReactionUpdate", message);
        });
        this.client.on("messageReactionUpdate", async(message, emoji, userID) => {
            message = message.channel.messages.get(message.id) || await this.client.getMessage(message.channel.id, message.id);
            message.channel.messages.set(message.id, message);
            const guildEntry = this.client.guildData.get(message.guild.id);
            if (!guildEntry || !guildEntry.starboard.channel) return;
            let image = message.attachments[0] ? (new RegExp(/.jpg|.jpeg|.png|.gif/gim).test(message.attachments[0].url) ? message.attachments[0].url : false) : false;
            if (!messages.get(message.id)) {
                messages.set(message.id, {
                    id: message.id,
                    content: message.content,
                    channel: message.channel,
                    author: message.author,
                    timeoutLaunched: false,
                    image: image,
                    stars: undefined
                });
            }
            //If the timeout to update is not already launched, launch it
            if (!messages.get(message.id).timeoutLaunched) {
                setTimeout(async() => {
                    messages.get(message.id).timeoutLaunched = false;
                    messages.get(message.id).stars = await this.getStarsCount(message);
                    let starredMessage = messages.get(message.id);
                    let storedMessage = guildEntry.starboard.messages.find(m => m.id === message.id);
                    let starboardMessageExists = storedMessage ? await this.client.getMessage(guildEntry.starboard.channel, storedMessage.starboardMessage).catch(err => false) : false;
                    //If the message is not in the starboard yet and reach the minimum requirements, add it to the starboard
                    if ((!storedMessage || !starboardMessageExists) && starredMessage.stars >= guildEntry.starboard.minimum) {
                        if (storedMessage && !starboardMessageExists) guildEntry.starboard.messages.splice(guildEntry.starboard.messages.findIndex(m => m.id === message.id), 1);
                        try {
                            let starboardMessage = await this.client.createMessage(guildEntry.starboard.channel, {
                                embed: {
                                    description: starredMessage.content,
                                    author: {
                                        name: starredMessage.author.tag,
                                        icon_url: message.author.avatarURL
                                    },
                                    title: `${starredMessage.stars} :star:`,
                                    footer: {
                                        text: `In #${message.channel.name}`
                                    },
                                    image: image ? {
                                        url: image
                                    } : undefined,
                                    timestamp: new Date(message.timestamp).toISOString()
                                }
                            });
                            guildEntry.starboard.messages.push({
                                id: starredMessage.id,
                                starboardMessage: starboardMessage.id,
                                starboardChannel: starboardMessage.channel.id,
                                content: starredMessage.content,
                                author: starredMessage.author.id,
                                stars: starredMessage.stars,
                                image: image,
                                timestamp: new Date(message.timestamp).toISOString()
                            });
                            this.client.guildData.set(message.guild.id, guildEntry);
                        } catch (err) {}
                    }
                    //If the message is already in the starboard and still reach the minimum requirements, update it
                    else if (storedMessage && starredMessage.stars >= guildEntry.starboard.minimum && starboardMessageExists) {
                        if (storedMessage.starboardChannel !== guildEntry.starboard.channel) return;
                        try {
                            this.client.editMessage(storedMessage.starboardChannel, storedMessage.starboardMessage, {
                                embed: {
                                    description: starredMessage.content,
                                    author: {
                                        name: starredMessage.author.tag,
                                        icon_url: message.author.avatarURL
                                    },
                                    title: `${starredMessage.stars} :star:`,
                                    footer: {
                                        text: `In #${message.channel.name}`
                                    },
                                    image: image ? {
                                        url: image
                                    } : undefined,
                                    timestamp: storedMessage.timestamp
                                }
                            });
                            guildEntry.starboard.messages[guildEntry.starboard.messages.findIndex(m => m.id === message.id)] = {
                                id: storedMessage.id,
                                starboardMessage: storedMessage.starboardMessage,
                                starboardChannel: storedMessage.starboardChannel,
                                content: storedMessage.content,
                                author: starredMessage.author.id,
                                stars: starredMessage.stars,
                                image: image,
                                timestamp: storedMessage.timestamp
                            }
                            this.client.guildData.set(message.guild.id, guildEntry);
                        } catch (err) {}
                    }
                    //If the message is already in the starboard, but now under the requirements, delete it
                    else if (storedMessage && (starredMessage.stars < guildEntry.starboard.minimum) && starboardMessageExists) {
                        try {
                            this.client.deleteMessage(storedMessage.starboardChannel, storedMessage.starboardMessage);
                            guildEntry.starboard.messages.splice(guildEntry.starboard.messages.findIndex(m => m.id === message.id), 1);
                            this.client.guildData.set(message.guild.id, guildEntry);
                        } catch (err) {}
                    }
                }, 20000)
            }
            let inQueueMessage = messages.get(message.id);
            inQueueMessage.timeoutLaunched = true;
            messages.set(message.id, inQueueMessage);
        });
    }

    getStarsCount(message) {
        return new Promise(async(resolve, reject) => {
            let starOne = await message.getReaction('⭐');
            let starTwo = await message.getReaction('🌟');
            let uniqueUsers = [];
            let merged = starOne.concat(starTwo).map(u => {
                if (!uniqueUsers.find(user => user.id === u.id)) {
                    uniqueUsers.push(u);
                }
            });
            resolve(uniqueUsers.length);
        });
    }
}

module.exports = StarboardManager;