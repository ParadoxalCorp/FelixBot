'use strict';

const Command = require('../../util/helpers/modules/Command');
const axios = require('axios');

class Udefine extends Command {
    constructor() {
        super();
        this.help = {
            name: 'udefine',
            description: 'Search definitions through urbandictionary',
            usage: 'udefine pizza',
            category: 'fun'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: ["urdef", "define", "urban"],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    //eslint-disable-next-line no-unused-vars
    async run(client, message, args, guildEntry, userEntry) {
        if (!args[0]) {
            return message.channel.createMessage(":x: No search term specified");
        }
        const result = await axios.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(args.join(' '))}`);
        if (!result.data) {
            return message.channel.createMessage(":x: an error occurred");
        }
        if (!result.data.list[0]) {
            return message.channel.createMessage(":x: I couldn't find any results :c");
        }
        const firstResult = result.data.list[0];
        return message.channel.createMessage({
            embed: {
                color: client.config.options.embedColor,
                title: `Results`,
                url: firstResult.permalink,
                fields: [{
                    name: "**Definition:**",
                    value: firstResult.definition.length > 1000 ? firstResult.definition.substr(0, 990) + '...' : firstResult.definition
                }, {
                    name: "**Example:**",
                    value: '*' + firstResult.example + '*'
                }, {
                    name: "**Author:**",
                    value: firstResult.author
                }],
                footer: {
                    text: `👍${firstResult.thumbs_up} | ${firstResult.thumbs_down}👎`
                },
                timestamp: new Date()
            }
        });
    }
}

module.exports = new Udefine();