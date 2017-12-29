const getLevelDetails = require('../../util/helpers/getLevelDetails');

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
                client.userData.forEach(u => {
                    let recalculated = getLevelDetails(200, u.experience.expCount);
                    u.experience.level = recalculated.level;
                    client.userData.set(u.id, u);
                });
                client.guildData.forEach(g => {
                    g.generalSettings.levelSystem.users.forEach(m => {
                        let recalculated = getLevelDetails(200, m.expCount);
                        g.generalSettings.levelSystem.users.find(member => member.id === m.id).level = recalculated.level;
                    });
                    client.guildData.set(g.id, g);
                });
                resolve(await message.channel.createMessage(`:white_check_mark: Successfully updated all users levels in **${Date.now() - startTime}**ms`));
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new Dummy();