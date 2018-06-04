const Command = require('../../util/helpers/modules/Command');
const util = require('util')

class Announce extends Command {
    constructor() {
        super();
        this.help = {
            name: 'Announce',
            category: 'moderation',
            description: 'Check your balance',
            usage: '{prefix} announce'
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
                    description: "What's the color of this announcement? You can choose between the 3 predefined ones: `red`, `orange`, `lightblue` or use a custom base 6 HEX color in the format `#000000`"
                },
                {
                    description: "What's the content of this announcement? You can use the usual markdown, and even masked links using `[masked link](http://google.com)`"
                },
                {
                    description: "Answer with the channel name in which i should send the announcement"
                }
            ]
        };
    }

    async run(client, message, args) {
        console.log(args);
        try {
            let embedObject = {
                description: '',
                footer: {
                    icon_url: message.author.avatarURL,
                    text: `${message.author.username}#${message.author.discriminator}`
                },
                timestamp: new Date()
            };
            embedObject.title = args[0].substr(0, 256);
            if (args[1].trim() === "red") embedObject.color = 0xff0000;
            else if (args[1].trim() === "orange") embedObject.color = 0xff6600;
            else if (args[1].trim() === "lightblue") embedObject.color = 0x33ccff;
            else if (args[1].trim() === "none") embedObject.color = 0x000;
            else embedObject.color = parseInt(`0x${args[1].split("#")[1]}`);

            embedObject.description = args[2];

            message.channel.guild.channels.get(args[3].substr(2, 18)).createMessage({
                embed: embedObject
            });

        } catch (error) {
            return message.channel.createMessage(`A error happened, try again!`);
        }
    }
}

module.exports = new Announce();