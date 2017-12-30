const registerCase = require("../../util/helpers/registerCase.js");

class Hackban {
    constructor() {
        this.help = {
            name: "hackban",
            usage: "hackban <user_id> <days_of_messages_to_delete> -r <reason>",
            description: "Hackban a user who is not currently in the server with their ID. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached"
        }
        this.conf = {
            guildOnly: true,
            requirePerms: ['banMembers', 'viewAuditLogs']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify the id of a user to hackban, i can't just hackban randomly`));
                let userToBan = args.filter(a => !isNaN(a) && a.length > 10)[0];
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                let screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                if (!new RegExp(/\.jpg|.png|.gif|.jpeg/gim).test(screenshot)) screenshot = undefined;
                if (new RegExp(/\-s/gim).test(reason)) reason = reason.split(/\-s/gim)[0].trim();
                let daysAmount = args.filter(a => a.length < 2).filter(a => !isNaN(a))[0] ? (Math.round(args.filter(a => !isNaN(a))[0]) > 7 ? 7 : parseInt(Math.round(args.filter(a => !isNaN(a))[0]))) : 0;
                if (!userToBan) return resolve(await message.channel.createMessage(`:x: You need to specify a valid ID`));
                if (userToBan === message.author.id) return resolve(await message.channel.createMessage(`:x: Well no you can't hackban yourself that's not how it works ;-;`));
                if (message.guild.members.get(userToBan)) return resolve(await message.channel.createMessage(`:x: That user is in this server, please use \`ban\` instead`));
                let bannedUsers = await message.guild.getBans();
                if (bannedUsers.find(u => u.user.id === userToBan)) {
                    let modCase = guildEntry.generalSettings.modLog.filter(c => c.user.id === userToBan && (new RegExp(/ban|hackban/gim).test(c.action)));
                    let mostRecentCase = modCase.sort((a, b) => b.timestamp - a.timestamp)[0];
                    return resolve(await message.channel.createMessage(mostRecentCase ? `:x: That user is already banned (case \`#${guildEntry.generalSettings.modLog.findIndex(c => c.timestamp === mostRecentCase.timestamp) + 1}\`)` : ":x: That user is already banned"));
                }
                //Here we do something slightly different, since for some reasons the audit log entries don't provide the user object
                //And the banned user isn't returned by discord's api, the guildBanAdd listener will handle the logging since it receives the user
                client.guilds.get(message.guild.id).lastHackbanned = {
                    user: userToBan,
                    moderator: message.author,
                    screenshot: screenshot,
                    reason: reason
                };
                const bannedUser = await message.guild.banMember(userToBan, daysAmount, `Hack-banned by ${message.author.tag}: ${reason ? reason : "No reason specified"}`).catch(err => false);
                if (bannedUser === false) return resolve(await message.channel.createMessage(`:x: I couldn't hackban this user, the user ID is probably invalid`));
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully hack-banned the user <@${userToBan}>`));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Hackban();