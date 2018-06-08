'use strict';

const Command = require('../../util/helpers/modules/Command');

class LoveShip extends Command {
    constructor() {
        super();
        this.help = {
            name: 'loveship',
            description: 'Ship a user with another user !',
            usage: '{prefix}loveship <user_resolvable> <user_resolvable>',
            category: 'image',
            subCategory: 'image-generation'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ['ship'],
            requirePerms: ['attachFiles'],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [],
            require: ['weebSH', 'taihou']
        };
    }

    //eslint-disable-next-line no-unused-vars
    async run(client, message, args, guildEntry, userEntry) {
        if (!args[0]) {
            return message.channel.createMessage(':x: You need to specify at least one user to ship');
        }
        const firstUser = await this.getUserFromText({client: client, message: message, text: args[0]});
        const secondUser = args[1] ? await this.getUserFromText({client: client, message: message, text: args.splice(1).join(' ')}).then(u => u ? u : client.extendedUser(message.author)) : client.extendedUser(message.author);
        if (!firstUser && secondUser.id === message.author.id) {
            return message.channel.createMessage(':x: I\'m sorry but i couldn\'t find the users you specified :c');
        } else if (firstUser.id === secondUser.id) {
            return message.channel.createMessage(`:x: You can't match a user with themselves, like, why?`);
        }
        let typing = false;
        //If the queue contains 2 items or more, expect that this request will take some seconds and send typing to let the user know
        if (client.weebSH.korra.requestHandler.queue.length >= 2) {
            client.bot.sendChannelTyping(message.channel.id);
            typing = true;
        }
        const generatedShip = await client.weebSH.korra.generateLoveShip(this.useWebpFormat(firstUser.avatarURL), this.useWebpFormat(secondUser.avatarURL)).catch(this.handleError.bind(this, client, message, typing));
        const match = (() => {
            let msg = typing ? `<@!${message.author.id}> ` : '';
            msg += `I, Felix von Trap, by the powers bestowed upon me, declare this a **${this.calculateMatch(firstUser.id, secondUser.id)}** match`;
            return msg;
        })();
        return message.channel.createMessage(match, {file: generatedShip, name: `${Date.now()}-${message.author.id}.png`});
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

    calculateMatch(firstID, secondID) {
        const total = parseInt(firstID) + parseInt(secondID);
        const sliced = total.toString().split('');
        return `${sliced[6]}${sliced[15]}%`;
    }
}

module.exports = new LoveShip();