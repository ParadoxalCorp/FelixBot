const Command = require('../../util/helpers/modules/Command');

class Announce extends Command {
    constructor() {
        super();
        this.help = {
            name: 'announce',
            category: 'moderation',
            description: 'Announce something with a beautiful (or smth) embed',
            usage: '{prefix}announce'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: [
                {
                    description: "What's the title of this announcement (max: 256 characters)?"
                },
                {
                    description: "What's the color of this announcement? You can choose between the 3 predefined ones: `red`, `orange`, `lightblue` or use a custom HEX color in the format `#000000`"
                },
                {
                    description: "What's the content of this announcement? You can use the usual markdown, and even masked links using `[masked link](https://google.com)`"
                },
                {
                    description: "Finally, in which channel should i send the announcement?"
                }
            ]
        };
    }

    async run(client, message, args) {
            let embedObject = {
                title: '',
                description: '',
                footer: {
                    icon_url: message.author.avatarURL,
                    text: `${message.author.username}#${message.author.discriminator}`
                },
                color: 0x000,
                timestamp: new Date()
            };
            embedObject.title = args[0].substr(0, 256);
            if (args[1].trim() === "red") {
                embedObject.color = 0xff0000;
            }
            else if (args[1].trim() === "orange") {
                embedObject.color = 0xff6600;
            }
            else if (args[1].trim() === "lightblue") {
                embedObject.color = 0x33ccff;
            }
            else if (args[1].trim() !== "none") {
                embedObject.color = parseInt(`0x${args[1].split("#")[1]}`);
                embedObject.color = embedObject.color === NaN ? 0x000 : embedObject.color;
            }

            embedObject.description = args[2];
            if (!embedObject.description && !embedObject.title) {
                return message.channel.createMessage(':x: At least either the title or the description is mandatory');
            }
            const channel = await this.getChannelFromText({client: client, message: message, text: args[3]});
            if (!channel) {
               return message.channel.createMessage(':x: I couldn\'t find the channel you specified :v');
            }
            channel.createMessage({
                embed: embedObject
            });
    }
}

module.exports = new Announce();