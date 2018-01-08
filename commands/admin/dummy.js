class Dummy {
    constructor() {
        this.help = {
            name: 'dummy',
            description: 'i said dummy',
            usage: 'dummy'
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                let startTime = Date.now();
                client.guildData.forEach(g => {
                    let newDataStructure = {
                        id: g.id,
                        generalSettings: {
                            prefix: g.generalSettings.prefix,
                            disabledModules: g.generalSettings.disabledModules,
                            autoAssignablesRoles: g.generalSettings.autoAssignablesRoles
                        },
                        levelSystem: g.generalSettings.levelSystem,
                        modLog: {
                            cases: g.generalSettings.modLog,
                            channel: g.generalSettings.modLogChannel
                        },
                        starboard: g.starboard,
                        permissions: g.permissions,
                        onEvent: g.onEvent
                    };
                    client.guildData.set(g.id, newDataStructure);
                });
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully updated all guilds data structure in **${Date.now() - startTime}**ms`));
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Dummy();