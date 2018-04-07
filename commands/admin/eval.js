'use strict';

const Command = require('../../util/helpers/Command');
const { inspect } = require('util');

class Eval extends Command {
    constructor() {
        super();
        this.help = {
            name: 'eval',
            category: 'admin',
            description: 'eval, i think it\'s fairly obvious at this point',
            usage: '{prefix} eval'
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
            return message.channel.createMessage('baguette tbh');
        }
        try {
            let evaluated = new RegExp(/--await/gim).test(message.content) ? await eval(args.join(" ").split("--await")[0]) : eval(args.join(" "));
            throw evaluated;
        } catch (err) {

            if (typeof err !== 'string') {
                err = inspect(err, {
                    depth: +!(inspect(err, { depth: 1 }).length > 1990), // Results in either 0 or 1
                    showHidden: true
                });
            }
            return message.channel.createMessage({
                embed: {
                    title: ":gear: Eval results",
                    description: "**Input:**\n```js\n" + args.join(" ") + "```\n**Output:**\n```js\n" + client.redact(err) + "```"
                }
            });
        }
    }
}

module.exports = new Eval();