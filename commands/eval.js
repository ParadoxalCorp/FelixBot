const unirest = require("unirest"),
    moment = require("moment");
exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        const allowedUsers = ['140149699486154753', '162325985079984129', '242408724923154435'];
        if (allowedUsers.includes(message.author.id)) {
            var args = message.content.split(/\s+/gim);
            args.shift();
            if (args.length === 0) {
                return resolve(await message.channel.send(":x: I need something in order to evaluate it"));
            }
            try {
                const evaluated = eval(args.join(" "));
                throw "Success: " + evaluated;
            } catch (err) {
                resolve(await message.channel.send({
                    embed: {
                        title: ":gear: Eval results",
                        description: "**Input:**\n```js\n" + args.join(" ") + "```\n**Output:**\n```js\n" + err + "```"
                    }
                }));
            }
        } else {
            resolve(await message.channel.send("Nyahahahahahhaha, no."));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'eval',
    description: 'Evaluates arbitrary javascript.',
    usage: 'eval some code',
    category: 'admin'
};