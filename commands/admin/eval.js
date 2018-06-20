'use strict';

const Command = require('../../util/helpers/modules/Command');
const { inspect } = require('util');

class Eval extends Command {
    constructor() {
        super();
        this.help = {
            name: 'eval',
            category: 'admin',
            description: 'eval, i think it\'s fairly obvious at this point',
            usage: '{prefix}eval'
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
        let toEval = args.join(' ').replace(/;\s+/g, ';\n').trim();
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
                    depth: parsedArgs['depth'] ? parseInt(parsedArgs['depth']) : this.getMaxDepth(err, toEval),
                    showHidden: true
                });
            }
            return message.channel.createMessage({
                embed: {
                    title: ":gear: Eval results",
                    description: "**Input:**\n```js\n" + toEval + "```\n**Output:**\n```js\n" + client.redact(err) + "```"
                }
            });
        }
    }

    getMaxDepth(toInspect, toEval) {
        let maxDepth;
        for (let i = 0; i < 10; i++) {
            if (inspect(toInspect, { depth: i }).length > (1980 - toEval.length)) {
                return maxDepth = i - 1;
            }
        }
        return 10;
    }
}

module.exports = new Eval();