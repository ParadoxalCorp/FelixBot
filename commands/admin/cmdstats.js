class CommandsStats {
    constructor() {
        this.help = {
            name: 'cmdstats',
            usage: 'cmdstats [category?=all]',
            description: 'Print some fancy stats about commands, wait, what? Nobody cares you say? I DO (╯°□°）╯︵ ┻━┻'
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                //Overall stats if no category is specified
                let overallCommandsUsed = 0;
                const commandsStats = client.clientData.get("commandsStats");
                if (!args[0]) {
                    let categories = [];
                    //Get commands usage since this run started
                    client.commands.forEach(c => {
                        let thisCategory = categories.findIndex(element => element.name === c.help.category);
                        if (thisCategory === -1) {
                            categories.push({
                                name: c.help.category,
                                uses: c.uses,
                                totalUses: 0
                            });
                        } else categories[thisCategory].uses = categories[thisCategory].uses + c.uses;
                    });
                    //Get overall commands usage for all runs
                    for (let command in commandsStats) {
                        let thisCommand = client.commands.get(command);
                        let thisCategory = categories.findIndex(element => element.name === thisCommand.help.category);
                        categories[thisCategory].totalUses = categories[thisCategory].totalUses + commandsStats[command];
                        overallCommandsUsed = overallCommandsUsed + commandsStats[command];
                    }
                    resolve(await message.channel.createMessage({
                        embed: {
                            title: 'Commands categories usage statistics',
                            description: '```\n' + categories.map(c => `${c.name}: ${c.uses}/${c.totalUses}`).join('\n') + '```',
                            footer: {
                                text: `For a total of ${client.commandsUsed}/${overallCommandsUsed} commands used`
                            }
                        }
                    }));
                } else {
                    if (!client.commands.filter(c => c.help.category === args[0]).size) return resolve(await message.channel.createMessage(':x: Invalid category name'));
                    for (let command in commandsStats) {
                        if (client.commands.get(command).help.category === args[0]) client.commands.get(command).totalUses = commandsStats[command];
                        overallCommandsUsed = overallCommandsUsed + commandsStats[command];
                    }
                    resolve(await message.channel.createMessage({
                        embed: {
                            title: `${args[0]}'s commands usage statistics`,
                            description: '```\n' + client.commands.filter(c => c.help.category === args[0]).map(c => `${c.help.name}: ${c.uses}/${c.totalUses}`).join('\n') + '```',
                            footer: {
                                text: `For a total of ${client.commandsUsed}/${overallCommandsUsed} commands used`
                            }
                        }
                    }));
                }
            } catch (err) {
                reject(err, message);
            }
        });
    }
}

module.exports = new CommandsStats();