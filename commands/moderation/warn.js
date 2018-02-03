const ModerationHandler = require("../../util/helpers/moderationHandler.js");

class Warn {
    constructor() {
        this.help = {
            name: "warn",
            usage: "warn <user_resolvable> -r <reason> -s <screenshot_url_or_attachment>",
            description: "warn a member from the server, reason is optional and can be added after. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached"
        }
        this.conf = {
            guildOnly: true,
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify a user to warn, i can't just warn randomly`));
                let memberToWarn = await message.getUserResolvable({
                    max: 1,
                    guildOnly: true
                });
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                let screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                if (!new RegExp(/\.jpg|.png|.gif|.webp|.jpeg/gim).test(screenshot)) screenshot = undefined;
                if (new RegExp(/\-s/gim).test(reason)) reason = reason.split(/\-s/gim)[0].trim();
                let daysAmount = args.filter(a => a.length < 2).filter(a => !isNaN(a))[0] ? (Math.round(args.filter(a => !isNaN(a))[0]) > 7 ? 7 : parseInt(Math.round(args.filter(a => !isNaN(a))[0]))) : 0;
                if (!memberToWarn.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the user you specified`));
                if (memberToWarn.first().id === message.author.id) return resolve(await message.channel.createMessage(`:x: Well no you can't warn yourself that's not how it works ;-;`))
                await ModerationHandler.registerCase(client, {
                    user: memberToWarn.first(),
                    action: "warn",
                    moderator: message.author,
                    reason: reason,
                    guild: message.guild,
                    screenshot: screenshot
                });
                let wew = ModerationHandler.addWarn({ client: client, guild: message.guild, user: memberToWarn.first(), reason: reason, moderator: message.author, screenshot: screenshot });
                console.log(wew, guildEntry.moderation.users.find(u => u.id === memberToWarn.first().id).warns);
                client.emit('warnsUpdate', message.guild, memberToWarn.first());
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully warned the user \`${memberToWarn.first().tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Warn();