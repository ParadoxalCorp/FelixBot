const DefaultStructures = require('../../helpers/defaultStructures');

module.exports = (client, message, args) => {
    return new Promise(async(resolve, reject) => {
        try {
            const guildEntry = client.guildData.get(message.guild.id);
            const at = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: New warn action',
                        description: 'At which warn count this action should be taken? Please keep in mind that you can\'t set 2 actions at the same warn count',
                        footer: {
                            text: 'Time limit: 60 seconds'
                        }
                    }
                }
            }).then(r => r.reply ? (r.reply.content === "abort" ? false : r.reply.content) : false);
            if (!at) return resolve(await message.channel.createMessage(`:x: Command aborted`));
            if (isNaN(at)) return resolve(await message.channel.createMessage(`:x: Warn count has to be a number`));
            if (guildEntry.moderation.warns.actions[Math.round(at)]) {
                return resolve(await message.channel.createMessage(`:x: There is already an action set to be taken at \`${Math.round(at)}\` warns`));
            }
            const actions = ['mute', 'kick', 'ban', 'soft-ban'];
            guildEntry.moderation.mutedRoles.forEach(r => actions.push({ customMutedRole: r.id, name: r.name }));
            let i = 1;
            const action = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: New warn action',
                        description: 'Please select the action that should be taken at `' + Math.round(at) + '` warns ```\n' + actions.map(a => `[${i++}] - ${a.customMutedRole ? (a.name ? a.name.replace(/%ROLE%/gim, message.guild.roles.get(a.customMutedRole).name) : message.guild.roles.get(a.customMutedRole).name) : a}`).join('\n') + '```',
                        footer: {
                            text: 'Time limit: 60 seconds'
                        }
                    }
                }
            }).then(r => r.reply ? (r.reply.content === "abort" ? false : r.reply.content) : false);
            if (!action) return resolve(await message.channel.createMessage(`:x: Command aborted`));
            if (isNaN(action)) return resolve(await message.channel.createMessage(`:x: You must enter the corresponding number of the action`));
            const customMessage = await message.awaitReply({
                message: {
                    embed: {
                        title: ':gear: New warn action',
                        description: 'Finally, the message that should be sent to the member. Reply with `none` to don\'t send any.\nYou can see the list of tags that you can use in the message on the [wiki](https://github.com/ParadoxalCorp/FelixBot/wiki/Moderation)',
                        footer: {
                            text: 'Time limit: 180 seconds'
                        }
                    }
                },
                limit: 180000
            }).then(r => r.reply ? (r.reply.content === "abort" ? false : r.reply.content) : false);
            if (!customMessage) return resolve(await message.channel.createMessage(`:x: Command aborted`));
            guildEntry.moderation.warns.actions[parseInt(Math.round(at))] = DefaultStructures.warnAction(actions[parseInt(Math.round(action)) - 1].customMutedRole ? 'mute' : actions[parseInt(Math.round(action)) - 1], customMessage.toLowerCase() !== "none" ? customMessage : false, actions[parseInt(Math.round(action)) - 1].customMutedRole);
            client.guildData.set(message.guild.id, guildEntry);
            resolve(await message.channel.createMessage(`:white_check_mark: Successfully added the action`));
        } catch (err) {
            reject(err);
        }
    });
}