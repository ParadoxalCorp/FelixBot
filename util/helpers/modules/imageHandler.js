'use strict';

/**
 * Generate the image sub-commands and such
 * @prop {object} client - The client given in the constructor
 */
class ImageHandler {
    /**
     * 
     * @param {object} client - The client instance
     */
    constructor(client) {
        this.client = client;
        this.interactions = {
            hug: {
                usage: '{prefix}hug <user_resolvable>',
                interaction: 'you\'ve just been hugged by'
            },
            pat: {
                usage: '{prefix}pat <user_resolvable>',
                interaction: 'you\'ve just been patted by'
            },
            cuddle: {
                usage: '{prefix}cuddle <user_resolvable>',
                interaction: 'you\'ve just been cuddled by'
            },
            kiss: {
                usage: '{prefix}kiss <user_resolvable>',
                interaction: 'you\'ve just been kissed by'
            },
            lick: {
                usage: '{prefix}lick <user_resolvable>',
                interaction: 'you\'ve just been l-licked by'
            },
            slap: {
                usage: '{prefix}slap <user_resolvable>',
                interaction: 'you\'ve just been slapped by'
            },
            tickle: {
                usage: '{prefix}tickle <user_resolvable>',
                interaction: 'you\'ve just been tickled by'
            },
            poke: {
                usage: '{prefix}poke <user_resolvable>',
                interaction: 'you\'ve just been poked by'
            },
        };
    }

    async generateSubCommands() {
        const imageTypes = await this.client.weebSH.toph.getImageTypes({preview: true});
        const Command = require('./Command');
        let generated = 0;
        const imageHandler = this;
        for (const type of imageTypes.types) {
            const preview = imageTypes.preview.find(p => p.type === type);
            class SubCommand extends Command {
                constructor() {
                super();
                this.help = {
                    name: type,
                    category: 'image',
                    subCategory: imageHandler.interactions[type] ? 'interactions' : 'images',
                    preview: preview.url,
                    description: `Return a ${type} image`,
                    usage: imageHandler.interactions[type] ? imageHandler.interactions[type].usage : `${type}`
                };
                this.conf = {
                    guildOnly: imageHandler.interactions[type] ? true : false,
                    requireDB: false,
                    require: ['weebSH', 'taihou'],
                    disabled: false,
                    aliases: [],
                    ownerOnly: false,
                    requirePerms: ['embedLinks'],
                    expectedArgs: [],
                    subCommand: true
                };
            }
                async run(client, message, args) {
                    const image = await client.weebSH.toph.getRandomImage(type);
                    if (!imageHandler.interactions[type]) {
                        return message.channel.createMessage({
                            embed: {
                                image: {
                                    url: image.url,
                                },
                                footer: {
                                    text: 'Powered by weeb.sh and the Taihou wrapper'
                                },
                                color: client.config.options.embedColor
                        }});
                    }
                    const users = await (async() => {
                        let resolvedUsers = [];
                        for (const arg of args) {
                            const resolved = await this.getUserFromText({client: client, message: message, text: arg});
                            if (resolved && !resolvedUsers.find(u => u.id === resolved.id) && (resolved.id !== message.author.id)) {
                                resolvedUsers.push(resolved);
                            }
                        }
                        return resolvedUsers.filter(u => u.id !== message.author.id);
                    })();
                    return message.channel.createMessage({
                        embed: {
                            description: users[0] ? `Hey ${users.map(u => u.mention).join(', ')}, ${imageHandler.interactions[type].interaction} ${message.author.mention} !` : `Trying to ${type} yourself eh? That's cute`,
                            image: {
                                url: image.url
                            },
                            footer: {
                                text: 'Powered by weeb.sh and the Taihou wrapper'
                            },
                            color: client.config.options.embedColor
                        }
                    });
                }
            }
            imageHandler.client.commands.set(type, new SubCommand());
            generated++;
        }
        return generated;
    }
}

module.exports = ImageHandler;