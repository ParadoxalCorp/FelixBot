const registerCase = require("../../util/helpers/moderationHandler.js").registerCase;

class Softban {
    constructor() {
        this.help = {
            name: "softban",
            usage: "softban <user_resolvable> <days_of_messages_to_delete> -r <reason> -s <screenshot_url_or_attachment>",
            description: "Softban a member from the server, its basically banning and unbanning instantly a member to deleta their messages. The reason is optional and can be added after. As for the number of days of messages to delete, this can be between 0 and 7. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached"
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
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify a user to softban, i can't just softban randomly`));
                let memberToBan = await message.getUserResolvable({
                    max: 1,
                    guildOnly: true
                });
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                let screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                if (!new RegExp(/\.jpg|.png|.gif|.jpeg/gim).test(screenshot)) screenshot = undefined;
                if (new RegExp(/\-s/gim).test(reason)) reason = reason.split(/\-s/gim)[0].trim();
                let daysAmount = args.filter(a => a.length < 2).filter(a => !isNaN(a))[0] ? (Math.round(args.filter(a => !isNaN(a))[0]) > 7 ? 7 : parseInt(Math.round(args.filter(a => !isNaN(a))[0]))) : 0;
                if (!memberToBan.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the user you specified`));
                if (memberToBan.first().id === message.author.id) return resolve(await message.channel.createMessage(`:x: Well no you can't softban yourself that's not how it works ;-;`))
                if (!daysAmount) return resolve(await message.channel.createMessage(`:x: You need to specify the amount of days of messages to delete`));
                if (!message.guild.members.get(memberToBan.first().id).bannable) return resolve(await message.channel.createMessage(`:x: I can't softban this member :v`));
                //This will be used to avoid triggering two times the case register
                client.guilds.get(message.guild.id).lastBanned = memberToBan.first().id;
                client.guilds.get(message.guild.id).lastUnbanned = memberToBan.first().id;
                await message.guild.members.get(memberToBan.first().id).ban(daysAmount, `Softbanned by ${message.author.tag}: ${reason ? (reason.length > 450 ? reason.substr(0, 410) + "... Reason is too long for the audit log, see case #" + guildEntry.modLog.cases.length + 1 : reason) : "No reason specified"}`);
                await message.guild.unbanMember(memberToBan.first().id, `Automatically unbanned: Softban requested by ${message.author.tag}`)
                await registerCase(client, {
                    user: memberToBan.first(),
                    action: "soft-ban",
                    moderator: message.author,
                    reason: reason,
                    color: 0xff9933,
                    guild: message.guild,
                    performedAction: `Has been soft-banned`,
                    screenshot: screenshot
                });
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully soft-banned the user \`${memberToBan.first().tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Softban();