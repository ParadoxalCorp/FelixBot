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
            const guildEntry = this.client.guildData.get(message.guild.id);
            if (!guildEntry || !guildEntry.starboard.channel) return;
            if (!messages.get(message.id)) {
                messages.set(message.id, {
                    id: message.id,
                    content: message.content,
                    channel: message.channel,
                    author: message.author,
                    timeoutLaunched: false,
                    stars: message.reactions['⭐'] || message.reactions['🌟'] ?
                        ((message.reactions['⭐'] ? message.reactions['⭐'].count : 0) + (message.reactions['🌟'] ? message.reactions['🌟'].count : 0)) :
                        (message.reactions.filter ? message.reactions.filter(r => ['⭐', '🌟'].includes(r.emoji.name)).size : 0)
                });
            } else {
                let inQueueMessage = messages.get(message.id);
                inQueueMessage.stars = message.reactions['⭐'] || message.reactions['🌟'] ?
                    ((message.reactions['⭐'] ? message.reactions['⭐'].count : 0) + (message.reactions['🌟'] ? message.reactions['🌟'].count : 0)) :
                    (message.reactions.filter ? message.reactions.filter(r => ['⭐', '🌟'].includes(r.emoji.name)).size : 0)
                messages.set(message.id, inQueueMessage);
            }
            if (!messages.get(message.id).timeoutLaunched) {
                setTimeout(async() => {
                    let inQueueMessage = messages.get(message.id);
                    inQueueMessage.timeoutLaunched = false;
                    messages.set(message.id, inQueueMessage);
                    let starredMessage = messages.get(message.id);
                    let storedMessage = guildEntry.starboard.messages.find(m => m.id === message.id);
                    if (!storedMessage && starredMessage.stars) {
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
                                    timestamp: new Date().toISOString()
                                }
                            });
                            guildEntry.starboard.messages.push({
                                id: starredMessage.id,
                                starboardMessage: starboardMessage.id,
                                starboardChannel: starboardMessage.channel.id,
                                content: starredMessage.content,
                                author: starredMessage.author.id,
                                stars: starredMessage.stars,
                                timestamp: new Date().toISOString()
                            });
                            this.client.guildData.set(message.guild.id, guildEntry);
                        } catch (err) {}
                    } else if (storedMessage && starredMessage.stars) {
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
                                timestamp: storedMessage.timestamp
                            }
                            this.client.guildData.set(message.guild.id, guildEntry);
                        } catch (err) {}
                    } else if (storedMessage && !starredMessage.stars) {
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
}

module.exports = StarboardManager;