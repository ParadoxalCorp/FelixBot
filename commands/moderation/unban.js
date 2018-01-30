const registerCase = require("../../util/helpers/moderationHandler.js").registerCase;

class Unban {
    constructor() {
        this.help = {
            name: "unban",
            usage: "unban <user_id> -r <reason>",
            description: "Unban a member from the server with their id, reason is optional and can be added after. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached"
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
                let screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                if (!new RegExp(/\.jpg|.png|.gif|.jpeg/gim).test(screenshot)) screenshot = undefined;
                if (new RegExp(/\-s/gim).test(reason)) reason = reason.split(/\-s/gim)[0].trim();
                let daysAmount = args.filter(a => a.length < 2).filter(a => !isNaN(a))[0] ? (Math.round(args.filter(a => !isNaN(a))[0]) > 7 ? 7 : parseInt(Math.round(args.filter(a => !isNaN(a))[0]))) : 0;
                if (!userToUnban) return resolve(await message.channel.createMessage(`:x: I couldn't find any banned user corresponding to this id`));
                //This will be used to avoid triggering two times the case register
                client.guilds.get(message.guild.id).lastUnbanned = userToUnban.id;
                await message.guild.unbanMember(userToUnban.id, `Unbanned by ${message.author.tag}: ${reason ? (reason.length > 450 ? reason.substr(0, 410) + "... Reason is too long for the audit log, see case #" + guildEntry.modLog.cases.length + 1 : reason) : "No reason specified"}`);
                if (guildEntry.modLog.channel) {
                    await registerCase(client, {
                        user: userToUnban,
                        action: "unban",
                        moderator: message.author,
                        reason: reason,
                        guild: message.guild,
                        screenshot: screenshot
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