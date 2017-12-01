class SetPrefix {
    constructor() {
        this.help = {
            name: 'setprefix',
            description: 'Change Felix\'s prefix',
            usage: 'setprefix new prefix',
            detailedUsage: '`{prefix}setprefix wew.` Will set the prefix to `wew.`, so commands will look like `wew.ping`'
        };
        this.conf = {
            aliases: ["prefix"],
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                if (args.length < 1) return resolve(await message.channel.createMessage(`:x: You did not specified a new prefix, the current prefix is \`${guildEntry.generalSettings.prefix}\``));
                else if (args[0].length > 8) return resolve(await message.channel.createMessage(`:x: The prefix cant exceed 8 characters !`));
                guildEntry.generalSettings.prefix = args[0];
                client.guildData.set(message.guild.id, guildEntry);
                resolve(await message.channel.createMessage(`:white_check_mark: The prefix is now \`${args[0]}\`, from now on commands will look like \`${args[0]}ping\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new SetPrefix();