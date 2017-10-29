const unirest = require("unirest");
exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/);
            args.shift();
            if (!args[0]) return resolve(await message.channel.send(':x: You did not specified a term to search'))
            let result = await client.request(`https://mashape-community-urban-dictionary.p.mashape.com/define?term=${args[0]}`, { header: 'X-Mashape-Key', value: client.config.mashapeKey });
            if (!result.body.list || !result.body.list[0]) return resolve(await message.channel.send(":x: I could not find anything"));
            let urResult = result.body.list[0];
            resolve(await message.channel.send({
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
                        value: urResult.example.substr(0, 1020)
                    }],
                    footer: {
                        text: `Wrote by: ${urResult.author} | 👍 ${urResult.thumbs_up} | 👎 ${urResult.thumbs_down}`
                    },
                    color: 0x00ADFF
                }
            }));
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: ["urdef", "define"],
    disabled: false
};

exports.help = {
    name: 'urban',
    description: 'Search something through Urban Dictionary',
    usage: 'urban lols',
    category: 'fun'
};