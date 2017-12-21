const registerCase = require("../../util/helpers/registerCase.js");

class Unban {
    constructor() {
        this.help = {
            name: "unban",
            usage: "unban <user_id> -r <reason>",
            description: "Unban a member from the server with their id, reason is optional and can be added after."
        }
        this.conf = {
            guildOnly: true,
            requirePerms: ['banMembers']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify a user to ban, i can't just ban randomly`));
                let bannedUsers = await message.guild.getBans();
                let userToUnban = bannedUsers.find(u => u.user.id === args[0]) ? bannedUsers.find(u => u.user.id === args[0]).user : false;
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                let daysAmount = args.filter(a => a.length < 2).filter(a => !isNaN(a))[0] ? (Math.round(args.filter(a => !isNaN(a))[0]) > 7 ? 7 : parseInt(Math.round(args.filter(a => !isNaN(a))[0]))) : 0;
                if (!userToUnban) return resolve(await message.channel.createMessage(`:x: I couldn't find any banned user corresponding to this id`));
                //This will be used to avoid triggering two times the case register
                client.guilds.get(message.guild.id).lastUnbanned = userToUnban.id;
                await message.guild.unbanMember(userToUnban.id, `Unbanned by ${message.author.tag}: ${reason ? reason : "No reason specified"}`);
                if (guildEntry.generalSettings.modLogChannel) {
                    await registerCase(client, {
                        user: userToUnban,
                        action: "unban",
                        moderator: message.author,
                        reason: reason,
                        guild: message.guild
                    });
                }
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully unbanned the user \`${userToUnban.username}#${userToUnban.discriminator}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Unban();