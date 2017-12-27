const npm = require("npm-module-search");

class NPM {
    constructor() {
        this.help = {
            name: 'npm',
            description: 'Search something through NPM',
            usage: 'npm express'
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!args[0]) return resolve(await message.channel.createMessage(":x: You must specify at least one argument"));
                npm.search(`${args.join(" ")}`, async(err, modules) => {
                    if (err) return reject(err);
                    if (!modules[0]) return resolve(await message.channel.createMessage(":x: Your search did not return any result"));
                    let embedFields = []; //Dynamically build the embed fields
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
                    resolve(await message.channel.createMessage({
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
                    }));
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new NPM();