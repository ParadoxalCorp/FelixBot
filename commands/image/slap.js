class Slap {
    constructor() {
        this.help = {
            name: 'slap',
            description: 'slap someone',
            usage: 'slap [user_resolvable]',
            category: 'image'
        };
        this.conf = {
            guildOnly: true,
            require: "wolkeImageKey"
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            const request = require("../../util/modules/request.js");
            try {
                let result = await request.get("https://api.weeb.sh/images/random?type=slap&filetype=gif", { header: 'Authorization', value: `Bearer ${client.config.wolkeImageKey}` });
                let users = await message.getUserResolvable();
                if (!result.body || !result.body.url) return resolve(await message.channel.send(":x: An error occurred :v"));
                resolve(await message.channel.send({
                    embed: {
                        description: users.first() ? `Hey ${users.map(u => '**' + u.tag + '**').join(", ")}, you've just been slapped by **${message.author.tag}**` : "",
                        image: {
                            url: result.body.url
                        },
                        footer: {
                            text: `Powered by https://weeb.sh/`
                        }
                    }
                }));
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new Slap();