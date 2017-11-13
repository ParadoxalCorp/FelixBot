class Eval {
    constructor() {
        this.help = {
            name: 'eval',
            category: 'admin',
            usage: 'eval some js here',
            description: 'Quickly eval some js so paradox can catch errors since he is a baka'
        };
        this.conf = {
            disabled: false,
            guildOnly: false,
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                //Missing arguments handling
                if (!args[0]) return resolve(await client.createMessage(message.channel.id, {
                    embed: {
                        title: ":gear: Eval results",
                        description: "**Input:**\n```js\nvoid\n```\n**Output:**\n```js\nbaguette```" //Quality error message tbh
                    }
                }));
                //Actual eval
                try {
                    let evaluated = eval(args.join(' '));
                    throw evaluated;
                } catch (err) {
                    resolve(await client.createMessage(message.channel.id, {
                        embed: {
                            title: ":gear: Eval results",
                            description: "**Input:**\n```js\n" + args.join(" ") + "```\n**Output:**\n```js\n" + err + "```"
                        }
                    }));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Eval();