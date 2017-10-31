const Discord = require("./paradoxal-d.js");
const client = new Discord.Client({
    disabledEvents: ["TYPING_START"]
});

const fs = require("fs-extra");
const unirest = require("unirest");

const dbPath = "config/config.json";
const PersistentCollection = require('djs-collection-persistent');

const database = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

var Raven = require('raven');
Raven.config(database.raven).install();

const {
    promisify
} = require('util');
const readdir = promisify(require("fs-extra").readdir);

//Database initialization
const userData = new PersistentCollection({
    name: 'userData'
});
console.log("[INFO] => Users database loaded");
const guildData = new PersistentCollection({
    name: 'guildData'
});
console.log("[INFO] => Guilds database loaded");
const tagData = new PersistentCollection({
    name: 'tagData'
});
console.log("[INFO] => Tags database loaded");
const clientData = new PersistentCollection({
    name: 'clientData'
});
console.log("[INFO] => Client database loaded");

//Load functions
let modulesLoading = async function() {
    return new Promise(async(resolve, reject) => {
        const clientFunctions = await readdir('./modules/clientFunctions');
        console.log(`----------------------------------------------------------------------------------------------\nLoading a total of ${clientFunctions.length} functions.`);
        clientFunctions.forEach(f => {
            try {
                require(`./modules/clientFunctions/${f}`)(client);
                console.log(`Loading function: ${f}. 👌`);
            } catch (e) {
                console.log(`Unable to load function ${f}: ${e.stack}`);
            }
        });
        const customModules = await readdir('./modules/modules');
        console.log(`----------------------------------------------------------------------------------------------\nLoading a total of ${customModules.length} modules.`);
        customModules.forEach(f => {
            try {
                require(`./modules/modules/${f}`)(client);
                console.log(`Loading custom module: ${f}. 👌`);
            } catch (e) {
                console.log(`Unable to load custom module ${f}: ${e.stack}`);
            }
        });
        resolve();
    });
};
client.mention = "<@343527831034265612>";
client.config = database;
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.database = database;
client.dbPath = dbPath;
client.overallHelp; //Will get initialized later
client.cmdsUsed = 0; //Will contain the count of commands used since restart
client.cmdsLogs; //Will get initialized in the message event
client.userData = userData;
client.guildData = guildData;
client.tagData = tagData;
client.clientData = clientData;
client.talkedRecently = new Set(); //cooldown stuff
client.ratelimited = new Set();
client.maintenance = false; //Will be used to ignore users when performing maintenance stuff
client.Raven = Raven;
client.upvotes = {
    users: false,
    latestUpdate: Date.now(),
    count: function() {
        return this.users.length
    }
}
client.statsUpdate = {
    success: {
        name: 'No Data',
        message: 'Server count hasn\'t been sent yet',
        description: function() {
            return `${this.name}: ${this.message}`;
        }
    },
    latestUpdate: false
}
client.imageTypes = {
    success: {
        name: 'No Data',
        message: `The weeb's image types didn't got fetched yet`,
        description: function() {
            return `${this.name}: ${this.message}`;
        }
    },
    latestUpdate: Date.now()
}

client.defaultUserData = function(id) {
    return {
        id: id,
        cooldowns: {
            dailyCooldown: 0
        },
        experience: {
            expCount: 0,
            level: 0
        },
        generalSettings: {
            lovePoints: 0,
            malAccount: "",
            blackListed: false,
            afk: false,
            reminders: [],
            points: 0,
            perks: {
                love: [{
                    type: 'default',
                    cooldown: 0
                }],
                boosters: []
            }
        },
        dataPrivacy: {
            publicLevel: true,
            publicProfile: true,
            publicLove: true,
            publicPoints: true,
            publicUpvote: true
        }
    }
}

client.defaultGuildData = function(id) {
    return {
        id: id,
        generalSettings: {
            autoAssignablesRoles: [],
            modLog: [],
            prefix: client.database.prefix,
            levelSystem: {
                enabled: false,
                downGrade: true,
                interval: false,
                levelUpNotif: false,
                roles: [],
                users: []
            },
        },
        permissions: {
            users: [],
            channels: [],
            roles: [],
            global: {
                allowedCommands: ['generic*', 'misc*', 'fun*', 'image*', 'utility*'],
                restrictedCommands: ['moderation*', 'settings*']
            }
        },
        onEvent: {
            guildMemberAdd: {
                onJoinRole: [],
                greetings: {
                    enabled: false,
                    message: false,
                    method: false,
                    channel: false,
                    error: false //Will be used for missing permissions case
                }
            },
            guildMemberRemove: {
                farewell: {
                    enabled: false,
                    message: false,
                    channel: false,
                    error: false //Will be used for missing permissions case
                }
            }
        }
    }
}

process.on('uncaughtException', (err) => {
    try {
        Raven.captureException(err);
    } catch (ravenErr) {
        console.error(ravenErr)
    } finally {
        console.error(err);
    }
});
process.on("unhandledRejection", err => {
    if (err.code === 50013) return; //Missing permissions    
    try {
        Raven.captureException(err);
    } catch (ravenErr) {
        console.error(ravenErr)
    } finally {
        console.error(err);
    }
});
process.on("error", err => {
    try {
        Raven.captureException(err);
    } catch (ravenErr) {
        console.error(ravenErr);
    } finally {
        console.error(err);
    }
});
//require node 8 or higher
(async function() {
    await modulesLoading();
    client.logger.draft('processLaunch', 'create', 'Logging in...');
    // load commands into memory, as a collection, so they're accessible everywhere
    const files = await readdir('./commands/');
    client.logger.draft('loadingCommands', 'create', `Loading a total of ${files.length} commands.`);
    let loadedCommands = 0;
    files.forEach(f => {
        try {
            const props = require(`./commands/${f}`);
            props.uses = 0; //For stats purposes
            loadedCommands++;
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
        } catch (e) {
            console.log(`Unable to load command ${f}: ${e.stack}`);
        }
    });
    client.logger.draft('loadingCommands', 'end', `Successfully loaded ${loadedCommands}/${files.length} commands`, true);
    const categories = ["generic", "misc", "image", "utility", "fun", "moderation", "settings"];
    for (let i = 0; i < categories.length; i++) {
        const categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
        client.overallHelp += `**${categories[i]}** =>` + categoryCommands.map(c => `\`${c.help.name}\` `) + "\n\n";
    }
    client.overallHelp = client.overallHelp.replace(/undefined/gim, ""); //To remove the "undefined"
    const evtFiles = await readdir('./events/');
    let eventsLoading = function() {
        return new Promise(async(resolve, reject) => {
            client.logger.draft('eventsLoading', 'create', `Loading a total of ${evtFiles.length} events.`);
            evtFiles.forEach(file => {
                const eventName = file.split(".")[0];
                const event = require(`./events/${file}`);
                // This line is awesome by the way. Just sayin'.
                client.on(eventName, event.bind(null, client));
                delete require.cache[require.resolve(`./events/${file}`)];
            });
            resolve(client.logger.draft('eventsLoading', 'end', `Loaded ${evtFiles.length} events`, true));
        });
    }
    await eventsLoading();
    client.logger.draft('database', 'create', 'Waiting for the database to be fully loaded...');
    setTimeout(async() => {
        client.logger.draft('database', 'edit', 'Database load complete, launching database auto-update')
        let dbUpdate = await client.updateDatabase(client); //Update database
        client.logger.draft('database', 'end', `Database auto-update complete: ${dbUpdate.usersUpdate} and ${dbUpdate.guildsUpdate}`, true);
        require('./api/server.js').launch(client, readdir);
    }, 7500);

    const coreData = await fs.readFile('./config/core-data.json');
    try {
        client.coreData = JSON.parse(coreData);
    } catch (err) {
        client.logger.draft('coreDataCorrupted', 'create', `Core data seems to be corrupted, attempting to restore from the backup...`);
        if (!client.clientData.has('exists')) client.logger.draft('coreDataCorrupted', 'end', `Core data (config/core-data.json) seems to be corrupted but no backup was found to restore it`);
        else {
            client.loadBackup()
                .then(() => {
                    client.coreData = JSON.parse(coreData);
                    client.logger.draft('coreDataCorrupted', 'end', 'Succeed to restore core-data from the backup', true);
                })
                .catch(err => client.logger.draft('coreDataCorrupted', 'end', err, false));
        }
    }

    client.login(client.config.token);

}());