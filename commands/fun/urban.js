const request = require("../../util/modules/request.js")

class Urban {
    constructor() {
        this.help = {
            name: 'urban',
            description: 'Search something through Urban Dictionary',
            usage: 'urban lols'
        }
        this.conf = {
            aliases: ["urdef", "define"],
            require: "mashapeKey"
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) return resolve(await message.channel.createMessage(':x: You did not specified a term to search'))
                let result = await request.get(`https://mashape-community-urban-dictionary.p.mashape.com/define?term=${args[0]}`, { 'X-Mashape-Key': client.config.mashapeKey });
                if (!result.data.list || !result.data.list[0]) return resolve(await message.channel.createMessage(":x: I could not find anything"));
                let urResult = result.data.list[0];
                resolve(await message.channel.createMessage({
                    embed: {
                        author: {
                            name: 'Urbandictionary',
                            url: urResult.permalink
                        },
                        title: `Definition of ${args[0]}`,
                        fields: [{
                            name: `:notepad_spiral: Definition`,
                            value: urResult.definition.substr(0, 1020)
                        }, {
                            name: `:pencil2: Example`,
                            value: urResult.example.substr(0, 1020) || "None"
                        }],
                        footer: {
                            text: `Wrote by: ${urResult.author} | 👍 ${urResult.thumbs_up} | 👎 ${urResult.thumbs_down}`
                        },
                        color: 0x00ADFF
                    }
                }));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Urban();