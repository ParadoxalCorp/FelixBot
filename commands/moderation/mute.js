const registerCase = require("../../util/helpers/registerCase.js");

class Mute {
    constructor() {
        this.help = {
            name: 'mute',
            usage: 'mute <user_resolvable> -r <reason>',
            description: 'Mute a member, reason is optional and can be added after'
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
                const mutedRole = message.guild.roles.find(r => r.name === "muted");
                if (!mutedRole) return resolve(await message.channel.createMessage(`:x: There is no \`muted\` role on this server`));
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify a user to mute, i can't just mute randomly`));
                let memberToMute = await message.getUserResolvable({
                    max: 1,
                    guildOnly: true
                });
                memberToMute = memberToMute.first() ? message.guild.members.get(memberToMute.first().id) : false;
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                if (!memberToMute) return resolve(await message.channel.createMessage(`:x: I couldn't find the user you specified`));
                if (memberToMute.roles.find(r => r === mutedRole.id)) return resolve(await message.channel.createMessage(`:x: The user \`${message.author.tag}\` is already muted`));
                if (mutedRole.position >= message.guild.roles.get(message.guild.members.get(client.user.id).highestRole).position) {
                    return resolve(await message.channel.createMessage(`:x: The \`muted\` role seems to be higher than my highest role, therefore i can't mute :v`));
                }
                await message.guild.members.get(memberToMute.id).addRole(mutedRole.id, `Muted by ${message.author.tag}: ${reason ? reason : "No reason specified"}`);
                const textChannels = Array.from(message.guild.channels.filter(c => c.type === 0).values());
                for (let i = 0; i < textChannels.length; i++) {
                    if (!textChannels[i].permissionOverwrites.get(mutedRole.id) || textChannels[i].permissionOverwrites.get(mutedRole.id).deny !== 2048) {
                        try {
                            await textChannels[i].editPermission(mutedRole.id, 0, 2048, 'role', 'Needed for the mute to properly work');
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
                if (guildEntry.generalSettings.modLogChannel) {
                    await registerCase(client, {
                        user: memberToMute.user,
                        action: "mute",
                        moderator: message.author,
                        reason: reason,
                        guild: message.guild
                    });
                }
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully muted the user \`${memberToMute.tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Mute();