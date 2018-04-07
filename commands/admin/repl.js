//Stolen from Tweetcord (https://github.com/Aetheryx/tweetcord) the 20/03/18
//Require Node 8.6.0 iirc (need support for ES2018 object spread properties)

const { inspect } = require('util');
const { createContext, runInContext } = require('vm');
const Command = require('../../util/helpers/Command');

class Repl extends Command {
    constructor() {
        super();
        this.help = {
            name: 'repl',
            usage: 'repl',
            description: 'Owner only, use `.exit` to exit, `.clear` to clear variables, `//` to ignore a message and `_` to get the last statement',
            category: 'admin'
        }
        this.conf = {
            ownerOnly: false,
            requireDB: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            disabled: false,
            expectedArgs: []
        }
    }

    async run(client, message, args) {
        const builtinLibs = (() => {
            const libs = {};
            const { _builtinLibs } = require('repl');

            for (const lib in _builtinLibs) {
                libs[_builtinLibs[lib]] = require(_builtinLibs[lib]);
            }

            return libs;
        })();

        const getContext = () => {
            const ctx = {
                ...client,
                ...builtinLibs,
                require,
                Buffer,
                __dirname,
                clearInterval,
                clearTimeout
            };

            createContext(ctx);
            return ctx;
        };

        let ctx = getContext();

        let lastRanCommandOutput;
        let statementQueue = [];
        let openingBrackets = 0;
        let closingBrackets = 0;

        message.channel.createMessage('REPL started. Available commands:\n```\n.exit\n.clear\n_\n```');
        const runCommand = async() => {
            const commandMsg = await client.messageCollector.awaitMessage(message.channel.id, message.author.id, 60e3);
            if (!commandMsg) {
                return message.channel.createMessage('Timed out, automatically exiting REPL...');
            }

            let { content } = commandMsg;

            if (content.startsWith('//')) {
                return runCommand();
            }
            if (content === '.exit') {
                return message.channel.createMessage('Successfully exited.');
            }
            if (content === '.clear') {
                ctx = getContext;
                statementQueue = [];
                message.channel.createMessage('Successfully cleared variables.');
                return runCommand();
            }

            ctx.message = commandMsg;
            ctx._ = lastRanCommandOutput;

            if (content.endsWith('}') && statementQueue[0]) {
                closingBrackets++;
                if (closingBrackets === openingBrackets) {
                    // Matching Closing and Opening brackets - we consume the statement queue
                    statementQueue.push(content);
                    content = statementQueue.join('\n');
                    statementQueue = [];
                    closingBrackets = 0;
                    openingBrackets = 0;
                } else {
                    statementQueue.push(content);
                    message.channel.createMessage(`\`\`\`js\n${statementQueue.join('\n')}\n  ...\n\`\`\``);
                    return runCommand();
                }
            } else if (content.endsWith('{') || statementQueue[0]) {
                if (content.endsWith('{')) openingBrackets++;
                if (content.endsWith('}') || content.startsWith('}')) closingBrackets++;
                // Opening bracket - we either open the statement queue or append to it
                statementQueue.push(content.endsWith('{') ?
                    content :
                    '  ' + content); // Indentation for appended statements
                message.channel.createMessage(`\`\`\`js\n${statementQueue.join('\n')}\n  ...\n\`\`\``);
                return runCommand();
            }

            let result;
            try {
                result = await runInContext(content, ctx, {
                    filename: 'aetheryx.repl'
                });

                lastRanCommandOutput = result;

                if (typeof result !== 'string') {
                    result = inspect(result, {
                        depth: +!(inspect(result, { depth: 1 }).length > 1990), // Results in either 0 or 1
                        showHidden: true
                    });
                }
            } catch (e) {
                const error = e.stack || e;
                result = `ERROR:\n${typeof error === 'string' ? error : inspect(error, { depth: 1 })}`;
            }

            message.channel.createMessage('```js\n' + client.redact(result) + '\n```');

            runCommand();
        };

        runCommand();
    }
}

module.exports = new Repl();