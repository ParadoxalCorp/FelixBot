class GuildSettings {
    constructor() {
        this.help = {
            name: 'guildsettings',
            category: 'admin',
            usage: 'guildsettings [guild_resolvable] ["reset_permissions"|"reset_prefix"|"reset_everything"]',
            description: `Basically allow admins to do some quick actions on a guild in the case this guild is running into some trouble`
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0] || !args[1]) return resolve(await message.channel.createMessage(`:x: Missing arguments(either a guild resolvable or the action to perform)`));
                let guild = await message.getGuildResolvable();
                if (!guild.size) return resolve(await client.createMessage(`:x: Couldn't find the specified guild`));
                if (!new RegExp(/reset_permissions|reset_prefix|reset_everything/gim).test(message.content)) return resolve(await message.channel.createMessage(`:x: Missing action to perform`));
                const guildEntry = client.guildData.get(guild.first().id);
                if (!guildEntry) return resolve(await message.channel.createMessage(":x: Somehow the guild isn't in the database")); //Prolly impossible case but eh                
                let defaultGuildData = client.defaultGuildData(guildEntry.id);
                if (new RegExp(/reset_permissions/gim).test(message.content)) {
                    guildEntry.permissions = defaultGuildData.permissions;
                    client.guildData.set(guildEntry.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Permissions of the guild \`${guild.first().name}\` have been reset`));
                } else if (new RegExp(/reset_prefix/gim).test(message.content)) {
                    guildEntry.generalSettings.prefix = client.config.prefix;
                    client.guildData.set(guildEntry.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Prefix of the guild \`${guild.first().name}\` has been set back ${client.config.prefix}`));
                } else if (new RegExp(/reset_everything/gim).test(message.content)) {
                    let confirmation = await message.awaitReply({
                        message: `Are you sure you want to do that? Answer with \`yes\` to confirm or anything else to abort`
                    });
                    if (!confirmation.reply || confirmation.reply.content !== "yes") return resolve(await client.createMessage(`:x: Aborted`));
                    client.guildData.set(guildEntry.id, defaultGuildData);
                    resolve(await message.channel.createMessage(`:white_check_mark: The data of the guild \`${guild.first().name}\` has been reset`));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new GuildSettings();