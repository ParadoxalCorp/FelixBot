const registerCase = require("../../util/helpers/moderationHandler.js").registerCase;
const sleep = require('../../util/modules/sleep');

class Unmute {
    constructor() {
        this.help = {
            name: 'unmute',
            usage: 'unmute <user_resolvable> -r <reason> -s <screenshot_url_or_attachment>',
            description: 'Unmute a member, reason is optional and can be added after. Screenshot is optional as well, it may be followed by the (single) url of the screenshot or stay blank if the screenshot is attached'
        }
        this.conf = {
            guildOnly: true,
            requirePerms: ['manageRoles']
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
                            };
                            if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify a user to unmute`));
                            let memberToUnmute = await message.getUserResolvable({
                                max: 1,
                                guildOnly: true
                            });
                            memberToUnmute = memberToUnmute.first() ? message.guild.members.get(memberToUnmute.first().id) : false;
                            let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                            let screenshot = message.attachments[0] ? message.attachments[0].url : (new RegExp(/\-s/gim).test(args.join(" ")) ? args.join(" ").split(/\-s/gim)[1].trim() : undefined);
                            if (!new RegExp(/\.jpg|.png|.gif|.jpeg/gim).test(screenshot)) screenshot = undefined;
                            if (new RegExp(/\-s/gim).test(reason)) reason = reason.split(/\-s/gim)[0].trim();
                            if (!memberToUnmute) return resolve(await message.channel.createMessage(`:x: I couldn't find the user you specified`));
                            if (!memberToUnmute.roles.find(r => r === mutedRole.id) && !memberToUnmute.roles.filter(r => guildEntry.moderation.mutedRoles.find(mr => mr.id === r))[0]) {
                                return resolve(await message.channel.createMessage(`:x: The user \`${memberToUnmute.tag}\` is not muted`));
                            }
                            let selectedRole = guildEntry.moderation.mutedRoles.filter(mr => memberToUnmute.roles.includes(mr.id))[0];
                            let mutedRoles = guildEntry.moderation.mutedRoles.filter(r => message.guild.members.get(memberToUnmute.id).roles.includes(r.id));
                            if (mutedRoles.length > 1) {
                                let i = 2;
                                let reply = await message.awaitReply({
                                    message: {
                                        embed: {
                                            description: 'This user has multiple muted roles, please select one with the corresponding number ```\n[1] - All muted roles\n' + mutedRoles.map(r => `[${i++}] - ${r.name ? r.name.replace(/%ROLE%/gim, message.guild.roles.get(r.id).name) : message.guild.roles.get(r.id).name}`).join('\n') + '```'
                                        }
                                    }
                                });
                                if (reply.reply && (reply.reply.content === "1" || mutedRoles[reply.reply.content - 2])) selectedRole = reply.reply.content === "1" ? mutedRoles : mutedRoles[reply.reply.content - 2];
                            };
                            if (Array.isArray(selectedRole)) {
                                const missingPermissionsRoles = [];
                                for (let i = 0; i < selectedRole.length; i++) {
                                    if (message.guild.members.get(client.user.id).highestRole && message.guild.roles.get(selectedRole[i].id).position >= message.guild.roles.get(message.guild.members.get(client.user.id).highestRole).position) {
                                        missingPermissionsRoles.push(selectedRole[i]);
                                    } else {
                                        message.guild.members.get(memberToUnmute.id).removeRole(selectedRole[i].id, `Unmuted by ${message.author.tag}: ${reason ? (reason.length > 450 ? reason.substr(0, 410) + "... Reason is too long for the audit log, see case #" + guildEntry.modLog.cases.length + 1 : reason) : "No reason specified"}`).catch(err => {
                                            console.log(err, `^ ${message.guild.id} | ${message.guild.name}`);
                                        });
                                    };
                                    await sleep(100);
                                };
                                if (missingPermissionsRoles[0]) {
                                    message.channel.send(`:x: I miss the permissions to remove the following role(s): ${missingPermissionsRoles.map(r => '`' + r.name + '`')}`);
                                };
                } else {
                    if (message.guild.members.get(client.user.id).highestRole && (selectedRole ? message.guild.roles.get(selectedRole.id).position : mutedRole.position) >= message.guild.roles.get(message.guild.members.get(client.user.id).highestRole).position) {
                        return resolve(await message.channel.createMessage(`:x: The \`${selectedRole ? selectedRole.name : 'muted'}\` role seems to be higher than my highest role, therefore i can't mute :v`));
                    }
                    await message.guild.members.get(memberToUnmute.id).removeRole(selectedRole ? selectedRole.id : mutedRole.id, `Unmuted by ${message.author.tag}: ${reason ? (reason.length > 450 ? reason.substr(0, 410) + "... Reason is too long for the audit log, see case #" + guildEntry.modLog.cases.length + 1 : reason) : "No reason specified"}`);
                }
                    await registerCase(client, {
                        user: memberToUnmute.user,
                        action: selectedRole ? (Array.isArray(selectedRole) ? 'Global unmute' : 'Removed' + (selectedRole.name ? selectedRole.name.replace(/%ROLE%/gim, message.guild.roles.get(selectedRole.id).name) : message.guild.roles.get(selectedRole.id).name)) : "unmute",
                        moderator: message.author,
                        reason: reason,
                        type: selectedRole && !Array.isArray(selectedRole) ? 3007 : undefined,
                        guild: message.guild,
                        screenshot: screenshot,
                        color: 0x00ff00,
                        performedAction: selectedRole ? (Array.isArray(selectedRole) ? 'Has been globally-unmuted' : `Removed ${selectedRole.name ? selectedRole.name.replace(/%ROLE%/gim, message.guild.roles.get(selectedRole.id).name) : message.guild.roles.get(selectedRole.id).name}`) : `Has been unmuted`
                    });
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully unmuted the user \`${memberToUnmute.tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Unmute();