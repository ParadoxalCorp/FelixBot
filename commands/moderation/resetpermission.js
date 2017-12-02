class ResetPermission {
    constructor() {
        this.help = {
            name: 'resetpermission',
            usage: 'resetpermission',
            description: 'Reset the custom permissions set until now'
        }
        this.conf = {
            guildOnly: true,
            aliases: ['resetperm', 'resetperms', 'nukeperm', 'nukeperms']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                let confirmation = await message.awaitReply({ message: "Are you sure you want to do that? This will reset all the custom permissions to default, answer with `yes` to confirm or anything else to abort" });
                if (!confirmation.reply || confirmation.reply.content.toLowerCase() !== "yes") {
                    message.channel.createMessage(":x: Command aborted").then(m => m.delete(5000));
                    if (confirmation.query) confirmation.query.delete();
                    return resolve(true);
                }
                guildEntry.permissions = client.defaultGuildData(message.guild.id).permissions;
                client.guildData.set(message.guild.id, guildEntry);
                resolve(message.channel.createMessage(`:white_check_mark: Successfully reset the permissions`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new ResetPermission();