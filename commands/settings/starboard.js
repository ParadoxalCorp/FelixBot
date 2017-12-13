class Starboard {
    constructor() {
        this.help = {
            name: "starboard",
            description: "Set the starboard",
            usage: "starboard -set starboard_channel",
            detailledUsage: "`{prefix}starboard -set starboard` Will set the starboard channel to the channel `starboard`\n`{prefix}starboard -disable` Disable and reset the settings of the starboard(aka the channel)"
        }
        this.conf = {
            guildOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                const set = new RegExp(/-set/gim).test(args.join(" "));
                const disable = new RegExp(/-disable/gim).test(args.join(" "));
                if (set) {
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
                } else if (!set && !disable) {
                    resolve(await message.channel.createMessage(`:x: You didn't specified what to do`));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Starboard();