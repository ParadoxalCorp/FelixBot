'use strict';

const Command = require('../../util/helpers/Command');

class Choose extends Command {
    constructor() {
        super();
        this.help = {
            name: 'choose',
            category: 'fun',
            description: 'Make felix choose between some stuff',
            usage: '{prefix} choose'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message) {
        if (!args[0]) return message.channel.createMessage(`:x: Well, I need some stuff to choose from, I can't choose from nothing sadly :v`);
                let choices = args.join(' ').split(/;|\|/).filter(c => c && c !== ' '); //Filter empty choices :^)
                if (choices.length < 2) return resolve(await message.channel.createMessage(`:x: Welp I need to choose from at least two things, I mean what's the point in choosing between only one thing?`));
                let choice = choices[Math.floor(Math.random() * choices.length)].trim();
                message.channel.createMessage(`I choose \`${choice}\`!`);
    }
}

module.exports = new Choose();
