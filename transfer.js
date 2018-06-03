'use strict';

const moduleIsInstalled = require('./util/modules/moduleIsInstalled');
const references = require('./util/helpers/data/references');

if (!moduleIsInstalled('enmap')) {
    console.error('The enmap module is missing, please run: npm install enmap@0.4.2');
    process.exit(0);
}

const Enmap = require('enmap');

if (!moduleIsInstalled('enmap-level')) {
    console.error('The enmap-level module is missing, please run: npm install enmap-level@1.0.0');
    process.exit(0);
}

const PersistentCollection = require('enmap-level');

const userData = new Enmap({
    provider: new PersistentCollection({
        name: 'userData'
    })
});

const guildData = new Enmap({
    provider: new PersistentCollection({
        name: 'guildData'
    })
});

const database = new(require('./util/helpers/modules/databaseWrapper'))({ config: require('./config') });

(async() => {
    let usersUpdated = 0;
    let guildsUpdated = 0;
    for (const user of userData) {
        const newModel = references.userEntry(user.id);
        newModel.experience.amount = user.experience.expCount === NaN ? 0 : Math.round(user.experience.expCount);
        newModel.love.amount = user.generalSettings.lovePoints === NaN ? 0 : Math.round(user.generalSettings.lovePoints);
        newModel.economy.coins = user.generalSettings.points === NaN || user.generalSettings.points < 0 ? 2500 : Math.ceil(user.generalSettings.points);
        newModel.blacklisted = user.generalSettings.blacklisted;
        await database.set(newModel, 'user');
        usersUpdated++;
    }
    console.log(`Finished the transfer of ${usersUpdated} users`);
    for (const guild of guildData) {
        const newModel = references.guildEntry(guild.id);
        newModel.selfAssignableRoles = guild.generalSettings.autoAssignablesRoles;
        newModel.experience.notifications.enabled = guild.levelSystem.levelUpNotif;
        newModel.experience.users = guild.levelSystem.users.map(u => {
            const newUserModel = references.guildMember(u.id);
            newUserModel.experience = u.expCount === NaN ? 0 : Math.round(u.expCount);
            return newUserModel;
        });
        await database.set(newModel, 'guild');
        guildsUpdated++;
    }
    console.log(`Finished the transfer of ${guildsUpdated} guilds`);
})();