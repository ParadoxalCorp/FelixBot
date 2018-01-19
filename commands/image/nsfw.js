class Nsfw {
    constructor() {
        this.help = {
            name: 'nsfw',
            description: 'Get a random nsfw pic owo, is restricted to nsfw channels/dm',
            usage: 'nsfw'
        };
        this.conf = {
            require: "wolkeImageKey"
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            const request = require("../../util/modules/request.js");
            try {
                if (!message.channel.nsfw && message.guild) return resolve(await message.channel.createMessage(`:x: This command can only be used in NSFW channels or in dm`));
                let nsfwTypes = client.nsfwImagesTypes || await request.get("https://api.weeb.sh/images/types?nsfw=only", { 'Authorization': `Bearer ${client.config.wolkeImageKey}`, 'User-Agent': 'FelixBot' });
                if (!client.nsfwImagesTypes) client.nsfwImagesTypes = nsfwTypes.data;
                if (!client.nsfwImagesTypes || !client.nsfwImagesTypes.types || !client.nsfwImagesTypes.types[0]) return resolve(await message.channel.createMessage(`:x: An error occured :v`));
                let result = await request.get(`https://api.weeb.sh/images/random?type=${client.nsfwImagesTypes.types[Math.floor(Math.random() * client.nsfwImagesTypes.types.length)]}&nsfw=only`, { 'Authorization': `Bearer ${client.config.wolkeImageKey}`, 'User-Agent': 'FelixBot' });
                if (!result.data || !result.data.url) return resolve(await message.channel.createMessage(":x: An error occurred :v"));
                resolve(await message.channel.createMessage({
                    embed: {
                        image: {
                            url: result.data.url
                        },
                        footer: {
                            text: `Powered by https://weeb.sh/`
                        }
                    }
                }));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Nsfw();