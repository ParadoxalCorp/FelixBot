const registerCase = require("../../util/helpers/registerCase.js");

class Kick {
    constructor() {
        this.help = {
            name: "kick",
            usage: "kick <user_resolvable> -r <reason>",
            description: "Kick a member from the server, reason is optional and can be added after."
        }
        this.conf = {
            guildOnly: true,
            requirePerms: ['kickMembers']
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                if (!args[0]) return resolve(await message.channel.createMessage(`:x: Well you might want to specify a user to kick, i can't just kick randomly`));
                let memberToKick = await message.getUserResolvable({
                    max: 1
                });
                let reason = new RegExp(/\-r/gim).test(args.join(" ")) ? args.join(" ").split(/\-r/gim)[1].trim() : undefined;
                let daysAmount = args.filter(a => a.length < 2).filter(a => !isNaN(a))[0] ? (Math.round(args.filter(a => !isNaN(a))[0]) > 7 ? 7 : parseInt(Math.round(args.filter(a => !isNaN(a))[0]))) : 0;
                if (!memberToKick.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the user you specified`));
                if (memberToKick.first().id === message.author.id) return resolve(await message.channel.createMessage(`:x: Well no you can't kick yourself that's not how it works ;-;`))
                if (!message.guild.members.get(memberToKick.first().id).kickable) return resolve(await message.channel.createMessage(`:x: I can't kick this member :v`));
                //This will be used to avoid triggering two times the case register
                client.guilds.get(message.guild.id).lastKicked = memberToKick.first().id;
                await message.guild.members.get(memberToKick.first().id).kick(`Kicked by ${message.author.tag}: ${reason ? reason : "No reason specified"}`);
                if (guildEntry.generalSettings.modLogChannel) {
                    await registerCase(client, {
                        user: memberToKick.first(),
                        action: "kick",
                        moderator: message.author,
                        reason: reason,
                        guild: message.guild
                    });
                }
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully kicked the user \`${memberToKick.first().tag}\``));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Kick();