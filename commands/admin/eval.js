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

    async run(client, message, args, guildEntry, userEntry) {
        if (!args[0]) {
            return message.channel.createMessage('baguette tbh');
        }
        let toEval = args.join('');
        const parsedArgs = client.commands.get('reload').parseArguments(args);
        for (const arg in parsedArgs) {
            toEval = toEval.replace(`--${arg + (typeof parsedArgs[arg] !== 'boolean' ? '=' + parsedArgs[arg] : '')}`, '');
        }
        try {
            let evaluated = parsedArgs['await'] ? await eval(toEval) : eval(toEval);
            throw evaluated;
        } catch (err) {
            //+!(inspect(err, { depth: parsedArgs['depth'] ? parseInt(parsedArgs['depth']) : 1 }).length > 1990)
            if (typeof err !== 'string') {
                err = inspect(err, {
                    depth: parsedArgs['depth'] ? parseInt(parsedArgs['depth']) : 1, // Results in either 0 or 1
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