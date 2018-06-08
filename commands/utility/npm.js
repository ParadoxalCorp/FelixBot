'use strict';

const Command = require('../../util/helpers/modules/Command');
const axios = require('axios');
const moment = require('moment');

class Npm extends Command {
    constructor() {
        super();
        this.help = {
            name: 'npm',
            category: 'utility',
            description: 'Search something through NPM',
            usage: '{prefix}npm hapi'
        };
        this.conf = {
            requireDB: false,
            disabled: false,
            aliases: [],
            requirePerms: [],
            guildOnly: false,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args) {
        if (!args[0]) {
            return message.channel.createMessage(':x: You must specify at least one keyword');
        }
        const results = await axios({
            method: 'get',
            url: `https://www.npmjs.com/search/suggestions?q=${encodeURIComponent(args.join(' '))}&size=${20}`,
            headers: { 'Content-Type': 'application/json' }
        }).then(r => r.data);
        if (!results[0]) {
            return message.channel.createMessage(':x: Your search did not return any result');
        }
        let embedFields = [];
        if (results[0].name) {
            embedFields.push({
                name: 'Name',
                value: `[${results[0].name}](https://www.npmjs.com/package/${results[0].name})`,
                inline: true
            });
        }
        if (results[0].version) {
            embedFields.push({
                name: 'Version',
                value: results[0].version,
                inline: true
            });
        }
        if (results[0].publisher) {
            embedFields.push({
                name: 'Author',
                value: typeof results[0].publisher === 'string' ? results[0].publisher : results[0].publisher.username,
                inline: true
            });
        }
        if (results[0].description) {
            embedFields.push({
                name: 'Description',
                value: results[0].description
            });
        }
        if (results[0].links) {
            embedFields.push({
                name: 'Links',
                value: (() => {
                    const links = [];
                    for (const key in results[0].links) {
                        links.push(`[${key}](${results[0].links[key]})`);
                    }
                    return links.join(', ');
                })()
            });
        }
        if (results[0].date) {
            embedFields.push({
                name: 'Latest release',
                value: `${client.timeConverter.toHumanDate(new Date(results[0].date).getTime())} (${moment().to(new Date(results[0].date).getTime())})`
            });
        }
        return message.channel.createMessage({
            embed: {
                color: client.config.options.embedColor,
                title: 'NPM',
                url: `https://www.npmjs.com/search?q=${encodeURIComponent(args.join('+'))}`,
                thumbnail: {
                    url: 'https://raw.githubusercontent.com/isaacs/npm/master/html/npm-256-square.png'
                },
                fields: embedFields,
                timestamp: new Date(),
            }
        });
    }
}

module.exports = new Npm();