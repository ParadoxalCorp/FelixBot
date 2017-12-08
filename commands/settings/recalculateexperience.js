const sleep = require("../../util/modules/sleep.js");
const timeConverter = require("../../util/modules/timeConverter");

class RecalculateExperience {
    constructor() {
        this.help = {
            name: 'recalculateexperience',
            usage: 'recalculateexperience',
            description: "Useful if you re-adjusted the requirements for a role, this will automatically remove the roles from the user who doesn't fit the requirements anymore and give it to the ones who now fit it"
        }
        this.conf = {
            guildOnly: true,
            aliases: ["recalcexp"]
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const guildEntry = client.guildData.get(message.guild.id);
                message.channel.send(`:white_check_mark: Alright, i just started to recalculate everything, this may take some time depending on how big the server is. I will notify you once im done ^ \n(Note that inactive users might be ignored)`);
                let startDate = Date.now();
                let guildRoles = [];
                //Fill guild roles 
                guildEntry.generalSettings.levelSystem.roles.forEach(r => {
                    if (!message.guild.roles.has(r.id)) return;
                    let guildRole = message.guild.roles.get(r.id);
                    guildRole.at = r.at,
                        guildRole.method = r.method;
                    guildRoles.push(guildRole);
                });

                //Check members
                for (let i = 0; i < guildEntry.generalSettings.levelSystem.users.length; i++) {
                    let u = guildEntry.generalSettings.levelSystem.users[i];
                    const member = message.guild.members.get(u.id);
                    if (!member) return;
                    let rolesToRemove = guildRoles.filter(r => parseInt(r.at) > parseInt(u[r.method === "message" ? "messages" : "level"]) && member.roles.find(role => role === r.id));
                    let rolesToAdd = guildRoles.filter(r => parseInt(r.at) <= parseInt(u[r.method === "message" ? "messages" : "level"]) && !member.roles.find(role => role === r.id));
                    //Remove roles with a higher requirement than the user has 
                    if (rolesToRemove[0]) {
                        for (let o = 0; o < rolesToRemove.length; o++) {
                            try {
                                await member.removeRole(rolesToRemove[o].id);
                                await sleep(1000);
                            } catch (err) {
                                console.error(err);
                            }
                        }
                    }
                    if (rolesToAdd[0]) {
                        //Add roles with a lower requirement than the user has
                        if (guildEntry.generalSettings.levelSystem.autoRemove && rolesToAdd[0]) {
                            rolesToAdd = [rolesToAdd.sort((a, b) => b.at - a.at)[0]];
                        }
                        for (let o = 0; o < rolesToAdd.length; o++) {
                            try {
                                await member.addRole(rolesToAdd[o].id);
                                await sleep(1000);
                            } catch (err) {
                                console.error(err);
                            }
                        }
                    }
                    if ((i + 1) === guildEntry.generalSettings.levelSystem.users.length) {
                        resolve(message.author.createMessage(`:white_check_mark: The recalculating and re-adjusting has been completed, it took \`${timeConverter.toElapsedTime(Date.now() - startDate, true)}\``).catch(err => err));
                    }
                };
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new RecalculateExperience();