class Eval {
    constructor() {
        this.help = {
            name: 'eval',
            usage: 'eval some js here',
            description: 'Quickly eval some js so paradox can catch errors since he is a baka',
            parameters: '--await(note: must always be after the js to eval)'
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
                if (!args[0]) return resolve(await message.channel.createMessage({
                    embed: {
                        title: ":gear: Eval results",
                        description: "**Input:**\n```js\nvoid\n```\n**Output:**\n```js\nbaguette```" //Quality error message tbh
                    }
                }));
                //Actual eval
                try {
                    let evaluated = new RegExp(/--await/gim).test(message.content) ? await eval(args.join(" ").split("--await")[0]) : eval(args.join(" "));
                    throw evaluated;
                } catch (err) {
                    resolve(await message.channel.createMessage({
                        embed: {
                            title: ":gear: Eval results",
                            description: "**Input:**\n```js\n" + args.join(" ") + "```\n**Output:**\n```js\n" + err + "```"
                        }
                    }));
                }
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new Eval();