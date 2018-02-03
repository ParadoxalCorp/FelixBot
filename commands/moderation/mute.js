const registerCase = require("../../util/helpers/moderationHandler.js").registerCase;

class Mute {
    constructor() {
        this.help = {
            name: 'mute',
            usage: 'mute <user_resolvable> -r <reason> -s <screenshot_url_or_attachment>',
            description: 'Mute a member, reason is optional and can be added after. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached'
        }
        this.conf = {
            guildOnly: true,
            requirePerms: ['manageRoles', 'manageChannels']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                guildEntry.moderation.mutedRoles = guildEntry.moderation.mutedRoles.filter(r => message.guild.roles.get(r.id));
                const mutedRole = message.guild.roles.find(r => r.name === "muted");
                if (!mutedRole && guildEntry.moderation.mutedRoles.length < 1) {
                    return resolve(await message.channel.createMessage(`:x: There is no \`muted\` role on this server nor any custom muted roles`));
                }
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify a user to mute, i can't just mute randomly`));
                let memberToMute = await message.getUserResolvable({
                    max: 1,
                    guildOnly: true
                });
                memberToMute = memberToMute.first() ? message.guild.members.get(memberToMute.first().id) : false;
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                let screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                if (!new RegExp(/\.jpg|.png|.gif|.webp|.jpeg/gim).test(screenshot)) screenshot = undefined;
                if (new RegExp(/\-s/gim).test(reason)) reason = reason.split(/\-s/gim)[0].trim();
                if (!memberToMute) return resolve(await message.channel.createMessage(`:x: I couldn't find the user you specified`));
                let selectedRole = guildEntry.moderation.mutedRoles.filter(mr => memberToMute.roles.includes(mr.id))[0];
                if (guildEntry.moderation.mutedRoles.length > 1) {
                    let i = 1;
                    let reply = await message.awaitReply({
                        message: {
                            embed: {
                                description: 'There is multiple mute roles, please select one with the corresponding number ```\n' + guildEntry.moderation.mutedRoles.map(r => `[${i++}] - ${r.name ? r.name.replace(/%ROLE%/gim, message.guild.roles.get(r.id).name) : message.guild.roles.get(r.id).name}`).join('\n') + '```'
                            }
                        }
                    });
                    if (reply.reply && guildEntry.moderation.mutedRoles[reply.reply.content - 1]) selectedRole = guildEntry.moderation.mutedRoles[reply.reply.content - 1];
                }
                if (memberToMute.roles.includes(selectedRole.id)) {
                    return resolve(await message.channel.createMessage(`:x: The user \`${memberToMute.tag}\` is already muted`));
                }
                if (message.guild.members.get(client.user.id).highestRole && (selectedRole ? message.guild.roles.get(selectedRole.id).position : mutedRole.position) >= message.guild.roles.get(message.guild.members.get(client.user.id).highestRole).position) {
                    return resolve(await message.channel.createMessage(`:x: The \`${selectedRole ? message.guild.roles.get(selectedRole.id).name : 'muted'}\` role seems to be higher than my highest role, therefore i can't mute :v`));
                }
                await message.guild.members.get(memberToMute.id).addRole(selectedRole ? selectedRole.id : mutedRole.id, `Muted by ${message.author.tag}: ${reason ? (reason.length > 450 ? reason.substr(0, 410) + "... Reason is too long for the audit log, see case #" + guildEntry.modLog.cases.length + 1 : reason) : "No reason specified"}`);
                //If its the default mute, use the default server-wide mute
                if (!selectedRole) {
                    const textChannels = Array.from(message.guild.channels.filter(c => c.type === 0).values());
                    for (let i = 0; i < textChannels.length; i++) {
                        if (!textChannels[i].permissionOverwrites.get(mutedRole.id) || textChannels[i].permissionOverwrites.get(mutedRole.id).deny !== 2112) {
                            try {
                                await textChannels[i].editPermission(mutedRole.id, 0, 2112, 'role', 'Needed for the mute to properly work');
                            } catch (err) {
                                console.error(err);
                            }
                        }
                    }
                }
                await registerCase(client, {
                    user: memberToMute.user,
                    action: selectedRole ? (selectedRole.name ? selectedRole.name.replace(/%ROLE%/gim, message.guild.roles.get(selectedRole.id).name) : message.guild.roles.get(selectedRole.id).name) : "mute",
                    moderator: message.author,
                    reason: reason,
                    type: selectedRole ? 3005 : undefined,
                    guild: message.guild,
                    screenshot: screenshot,
                    color: 0xffcc00,
                    performedAction: selectedRole ? `${selectedRole.name ? selectedRole.name.replace(/%ROLE%/gim, message.guild.roles.get(selectedRole.id).name) : message.guild.roles.get(selectedRole.id).name}` : `Has been muted`
                });
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully muted the user \`${memberToMute.tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Mute();