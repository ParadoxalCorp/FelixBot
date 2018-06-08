'use strict';

const Command = require('../../util/helpers/modules/Command');

class Choose extends Command {
    constructor() {
        super();
        this.help = {
            name: 'choose',
            category: 'fun',
            description: 'Make felix choose between some stuff',
            usage: '{prefix}choose <choice> ; <choice_2> ; <and_another_one>'
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

    async run(client, message, args) {
        if (!args[0]) {
            return message.channel.createMessage(`:x: Well, I need some stuff to choose from, I can't choose from nothing sadly :v`);
        }
        let choices = args.join(' ').split(/;/g).filter(c => c && c !== ' '); //Filter empty choices :^)
        if (choices.length < 2) {
            return message.channel.createMessage(`:x: Welp I need to choose from at least two things, I mean what's the point in choosing between only one thing?`);
        }
        let choice = choices[Math.floor(Math.random() * choices.length)].trim();
        message.channel.createMessage(`I choose \`${choice}\`!`);
    }
}

module.exports = new Choose();