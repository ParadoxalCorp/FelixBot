class Starboard {
    constructor() {
        this.help = {
            name: "starboard",
            description: "Set the starboard",
            usage: "starboard -setchannel starboard_channel",
            detailedUsage: "`{prefix}starboard -setchannel starboard` Will set the starboard channel to the channel `starboard`\n`{prefix}starboard -disable` Disable and reset the settings of the starboard(aka the channel)\n`{prefix}starboard -setminimum 2` Will set the minimum star amount required for a message to get into the starboard to 2\n`{prefix}starboard -settings` Will display the current starboard settings on this server"
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                const setchannel = new RegExp(/-setchannel/gim).test(args.join(" "));
                const disable = new RegExp(/-disable/gim).test(args.join(" "));
                const setMinimum = new RegExp(/-setminimum/gim).test(args.join(" "));
                const settings = new RegExp(/-settings/gim).test(args.join(" "));
                if (setchannel) {
                    let channel = await message.getChannelResolvable({
                        max: 1
                    });
                    if (!channel.first()) return resolve(await message.channel.createMessage(`:x: I couldn't find the specified channel :v`));
                    if (channel.first().id === guildEntry.starboard.channel) return resolve(await message.channel.createMessage(`:x: The channel \`${channel.first().name}\` is already set as the starboard channel`));
                    guildEntry.starboard.channel = channel.first().id;
                    client.guildData.set(message.guild.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, \`${channel.first().name}\` has been set as the starboard channel`));
                } else if (disable) {
                    if (!guildEntry.starboard.channel) return resolve(await message.channel.createMessage(`:x: The starboard is already disabled`));
                    guildEntry.starboard.channel = false;
                    client.guildData.set(message.guild.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: The starboard has successfully been disabled`));
                } else if (setMinimum) {
                    const minimumAmount = args.filter(a => !isNaN(a))[0] ? parseInt(Math.round(args.filter(a => !isNaN(a))[0])) : false;
                    if (!minimumAmount) return resolve(await message.channel.createMessage(`:x: You did not specify a minimum star amount`));
                    if (minimumAmount < 1) return resolve(await message.channel.createMessage(`:x: You can't set the minimum star amount to less than 1`));
                    guildEntry.starboard.minimum = minimumAmount;
                    client.guildData.set(message.guild.id, guildEntry);
                    resolve(await message.channel.createMessage(`:white_check_mark: Alright, the minimum star amount required for a message to get into the starboard has been set to \`${minimumAmount}\``));
                } else if (settings) {
                    resolve(await message.channel.createMessage({
                        embed: {
                            title: `:star: ${message.guild.name}'s starboard settings`,
                            fields: [{
                                name: `Starboard channel`,
                                value: guildEntry.starboard.channel ? `<#${guildEntry.starboard.channel}>` : `:x:`,
                                inline: true
                            }, {
                                name: `Minimum star amount`,
                                value: guildEntry.starboard.minimum,
                                inline: true
                            }]
                        }
                    }));
                } else if (!setchannel && !disable && !setMinimum && !settings) {
                    resolve(await message.channel.createMessage(`:x: You didn't specified what to do`));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Starboard();