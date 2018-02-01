const ModerationHandler = require("../../util/helpers/moderationHandler.js");

class Revoke {
    constructor() {
        this.help = {
            name: 'revoke',
            usage: 'revoke <user_resolvable> <warn_id> -r <reason> -s <screenshot_url_or_attachment>',
            description: "Revoke a warn or all warns from a member of the server, reason is optional and can be added after. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached",
            detailedUsage: "The case ID is shown with the `seewarns` command\n`{prefix}revoke @Baguette 1` Will revoke the warn #1 of the user `Baguette`\nDon't specify any case ID to revoke all warns"
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                const member = await message.getUserResolvable({ max: 1, guildOnly: true }).then(m => m.first());
                const warnID = args.filter(a => !isNaN(a))[0];
                const reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                const screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                if (!member) return resolve(await message.channel.createMessage(`:x: You did not specified a user for me to revoke a warn from them`));
                if (!guildEntry.moderation.users.find(u => u.id === member.id) || !guildEntry.moderation.users.find(u => u.id === member.id).warns[0]) {
                    return resolve(await message.channel.createMessage(`:x: The user \`${member.tag}\` hasn't received any warn`));
                }
                if (!warnID) {
                    let confirmation = await message.awaitReply({
                        message: {
                            embed: {
                                description: `This will revoke all warns of the user \`${member.tag}\`, are you sure you want to do that?\nReply with \`yes\` to confirm or anything else to abort`
                            }
                        }
                    });
                    if (!confirmation.reply || confirmation.reply.content.toLowerCase() !== "yes") {
                        return resolve(await message.channel.createMessage(`:x: Command aborted`));
                    }
                    guildEntry.moderation.users.find(u => u.id === member.id).warns = [];
                    client.guildData.set(message.guild.id, guildEntry);
                    await ModerationHandler.registerCase(client, {
                        user: member,
                        action: "revoke",
                        moderator: message.author,
                        reason: reason,
                        guild: message.guild,
                        screenshot: screenshot,
                        performedAction: 'Revoked all warns'
                    });
                    return resolve(await message.channel.createMessage(`:white_check_mark: Alright, i revoked all warns from \`${member.tag}\``));
                }
                if (!guildEntry.moderation.users.find(u => u.id === member.id).warns[Math.round(warnID) - 1]) {
                    return resolve(await message.channel.createMessage(`:x: The user \`${member.tag}\` has no warn with this ID`));
                }
                guildEntry.moderation.users.find(u => u.id === member.id).warns.splice(Math.round(warnID) - 1, 1);
                client.guildData.set(message.guild.id, guildEntry);
                await ModerationHandler.registerCase(client, {
                    user: member,
                    action: "revoke",
                    moderator: message.author,
                    reason: reason,
                    guild: message.guild,
                    screenshot: screenshot,
                    performedAction: `Revoked warn #${Math.round(warnID)}`
                });
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully revoked the warn \`#${Math.round(warnID)}\` of the user \`${member.tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Revoke();