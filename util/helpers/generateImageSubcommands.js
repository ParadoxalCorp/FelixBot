const SubCommand = require(`./SubCommand.js`);
const logger = require(`../modules/logger.js`);

module.exports = async(client) => {
    try {
        if (!client.imageTypes) return;
        logger.draft(`generatingSubCommands`, `create`, `Generating image subcommands`);
        let subCommandsGenerated = 0;
        let commandsStats = client.clientData.get('commandsStats');
        client.imageTypes.forEach(type => {
            let subCommand = new SubCommand({
                help: {
                    name: type,
                    category: "image",
                    usage: `${type}`,
                    description: `Get a random ${type} image from weeb.sh image API`
                },
                conf: {
                    guildOnly: false,
                    disabled: false,
                    require: "wolkeImageKey"
                },
                run: async function(client, message, args) {
                    return new Promise(async(resolve, reject) => {
                        const request = require(`../modules/request.js`);
                        try {
                            let result = await request.get(`https://api.weeb.sh/images/random?type=${type}`, { header: 'Authorization', value: `Bearer ${client.config.wolkeImageKey}` });
                            if (!result.body || !result.body.url) return resolve(await message.channel.createMessage(`:x: An error occured`));
                            resolve(await message.channel.createMessage({
                                embed: {
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
            });
            subCommand.uses = 0;
            if (!commandsStats[subCommand.help.name]) commandsStats[subCommand.help.name] = 0;
            if (!client.commands.has(subCommand.help.name)) client.commands.set(subCommand.help.name, subCommand);
            subCommandsGenerated++;
        });
        client.clientData.set('commandsStats', commandsStats);
        logger.draft(`generatingSubCommands`, `end`, `Generated ${subCommandsGenerated} image subcommands`, true);
    } catch (err) {
        client.emit("error", err);
    }
}