const unirest = require('unirest');

exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            let args = message.content.split(/\s+/);
            args.shift();
            var linkToResults = `https://developer.mozilla.org/en-US/search?locale=en-US&q=${args.join('+')}`;
            if (!args[0]) return resolve(await message.channel.send(":x: You must specify something to search"));
            let result = await client.request(`https://developer.mozilla.org/en-US/search.json?locale=en-US&q=${args.join('+')}`);
            if (!result.body.documents || !result.body.documents.length) return resolve(await message.channel.send(":x: Your search did not returned any result"))
            let firstResult = result.body.documents[0];
            await message.channel.send({
                embed: {
                    color: 3447003,
                    title: "MDN",
                    url: "https://developer.mozilla.org/en/",
                    thumbnail: {
                        "url": "https://developer.cdn.mozilla.net/static/img/opengraph-logo.dc4e08e2f6af.png"
                    },
                    fields: [{
                        name: "Search results",
                        value: `Here's the results for [${args.join(" ")}]` + `(
                                    https://developer.mozilla.org/en-US/search?locale=en-US&q=${args.join('+')})`
                    }, {
                        name: "**" + firstResult.title + "**",
                        value: firstResult.excerpt
                    }],
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: "MDN search"
                    }
                }
            })
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
};

exports.conf = {
    guildOnly: false,
    aliases: [],
    disabled: false
};

exports.help = {
    name: 'mdn',
    description: 'Search something through the Mozilla Developer Network',
    usage: 'mdn arrays',
    category: 'utility'
};