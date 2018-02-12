const registerCase = require("../../util/helpers/moderationHandler.js").registerCase;

class Ban {
    constructor() {
        this.help = {
            name: "ban",
            usage: "ban <user_resolvable> <days_of_messages_to_delete> -r <reason>",
            description: "Ban a member from the server, reason is optional and can be added after. As for the number of days of messages to delete, this can be between 0 and 7 and is 0 by default. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached"
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
                let memberToBan = await message.getUserResolvable({
                    max: 1,
                    guildOnly: true
                });
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                let screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                if (!new RegExp(/\.jpg|.png|.gif|.webp|.jpeg/gim).test(screenshot)) screenshot = undefined;
                if (new RegExp(/\-s/gim).test(reason)) reason = reason.split(/\-s/gim)[0].trim();
                let daysAmount = args.filter(a => a.length < 2).filter(a => !isNaN(a))[0] ? (Math.round(args.filter(a => !isNaN(a))[0]) > 7 ? 7 : parseInt(Math.round(args.filter(a => !isNaN(a))[0]))) : 0;
                if (!memberToBan.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the user you specified`));
                if (memberToBan.first().id === message.author.id) return resolve(await message.channel.createMessage(`:x: Well no you can't ban yourself that's not how it works ;-;`))
                if (!message.guild.members.get(memberToBan.first().id).bannable) return resolve(await message.channel.createMessage(`:x: I can't ban this member :v`));
                //This will be used to avoid triggering two times the case register
                client.guilds.get(message.guild.id).lastBanned = memberToBan.first().id;
                await message.guild.members.get(memberToBan.first().id).ban(daysAmount, `Banned by ${message.author.tag}: ${reason ? (reason.length > 450 ? reason.substr(0, 410) + "... Reason is too long for the audit log, see case #" + guildEntry.modLog.cases.length + 1 : reason) : "No reason specified"}`);
                await registerCase(client, {
                    user: memberToBan.first(),
                    action: "ban",
                    moderator: message.author,
                    reason: reason,
                    guild: message.guild,
                    screenshot: screenshot
                });
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully banned the user \`${memberToBan.first().tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Ban();