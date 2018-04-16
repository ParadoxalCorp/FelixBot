'use strict';

const Command = require('../../util/helpers/Command');
const npm = require("npm-module-search");

class Npm extends Command {
    constructor() {
        super();
        this.help = {
            name: 'npm',
            category: 'utility',
            description: 'Search something through NPM',
            usage: '{prefix} npm cluster'
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

    async run(client, message) {
        if (!args[0]) return message.channel.createMessage(":x: You must specify at least one argument");
                npm.search(`${args.join(" ")}`, async(err, modules) => {
                    if (err) return reject(err);
                    if (!modules[0]) return message.channel.createMessage(":x: Your search did not return any result");
                    let embedFields = [];
                    if (modules[0].name) {
                        embedFields.push({
                            name: "Name",
                            value: `[${modules[0].name}](https://www.npmjs.com/package/${modules[0].name})`,
                            inline: true
                        });
                    }
                    if (modules[0].version) {
                        embedFields.push({
                            name: "Version",
                            value: modules[0].version,
                            inline: true
                        });
                    }
                    if (modules[0].author) {
                        embedFields.push({
                            name: "Author",
                            value: modules[0].author,
                            inline: true
                        });
                    }
                    if (modules[0].description) {
                        embedFields.push({
                            name: "Description",
                            value: modules[0].description,
                            inline: true
                        });
                    }
                    message.channel.createMessage({
                        embed: {
                            color: 3447003,
                            title: "NPM",
                            url: "https://www.npmjs.com/search?q=" + args.join("+"),
                            thumbnail: {
                                url: "https://raw.githubusercontent.com/isaacs/npm/master/html/npm-256-square.png"
                            },
                            fields: embedFields,
                            timestamp: new Date(),
                        }
                    });
                });
    }
}

module.exports = new Npm();
