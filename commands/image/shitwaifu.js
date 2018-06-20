'use strict';

const Command = require('../../util/helpers/modules/Command');

class ShitWaifu extends Command {
    constructor() {
        super();
        this.help = {
            name: 'shitwaifu',
            description: 'Uh well, i think the name is pretty self-explanatory',
            usage: '{prefix}shitwaifu <user_resolvable>',
            category: 'image',
            subCategory: 'image-generation'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: ['attachFiles'],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [],
            require: ['weebSH', 'taihou']
        };
    }

    //eslint-disable-next-line no-unused-vars
    async run(client, message, args, guildEntry, userEntry) {
        const user = args[0] ? await this.getUserFromText({client: client, message: message, text: args[0]}).then(u => u || message.author) : message.author;
        let typing = false;
        //If the queue contains 2 items or more, expect that this request will take some seconds and send typing to let the user know
        if (client.weebSH.korra.requestHandler.queue.length >= 2) {
            client.bot.sendChannelTyping(message.channel.id);
            typing = true;
        }
        const generatedInsult = await client.weebSH.korra.generateWaifuInsult(this.useWebpFormat(user.avatarURL)).catch(this.handleError.bind(this, client, message, typing));
        return message.channel.createMessage(typing ? `<@!${message.author.id}> ` : '', {file: generatedInsult, name: `${Date.now()}-${message.author.id}.png`});
    }

    handleError(client, message, typing, error) {
        if (typing) {
            client.bot.sendChannelTyping(message.channel.id);
        }
        throw error;
    }

    useWebpFormat(url) {
        return url.replace(/.jpeg|.jpg|.png|.gif/g, '.webp');
    }
}

module.exports = new ShitWaifu();