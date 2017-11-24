const Enmap = require("enmap");
const PersistentCollection = require('enmap-level');
const fs = require(`fs-extra`);
const config = JSON.parse(fs.readFileSync(`./config/config.json`));
const sleep = require(`./util/modules/sleep.js`);
const logger = require("./util/modules/logger.js");

if (!config.token || config.token.length < 20) return logger.log(`No token found in config/config.json, aborted launch`, `error`);

//Overwrite Eris with enhanced classes
(async function() {
    logger.draft(`overwrite`, `create`, `Overwriting Eris...`);
    let extendedClasses = await fs.readdir(`./util/extendedClasses`);
    let overwroteFiles = 0;
    extendedClasses.forEach(f => {
        if (f === "util") return;
        try {
            fs.writeFileSync(`./node_modules/eris/lib/structures/${f}`, fs.readFileSync(`./util/extendedClasses/${f}`));
            overwroteFiles++;
        } catch (err) {
            console.error(`Failed to overwrite ${f}: ${err}`);
        }
    });
    await sleep(1000);
    let extendedUtil = await fs.readdir(`./util/extendedClasses/util`);
    extendedUtil.forEach(f => {
        try {
            fs.writeFileSync(`./node_modules/eris/lib/util/${f}`, fs.readFileSync(`./util/extendedClasses/util/${f}`));
            overwroteFiles++;
        } catch (err) {
            console.error(`Failed to overwrite ${f}: ${err}`);
        }
    });
    logger.draft(`overwrite`, `end`, `Overwrite completed: Overwrote ${overwroteFiles} classes out of the ${extendedClasses.length} needed`, overwroteFiles === extendedClasses.length ? true : false);
}());

const Eris = require("eris");

class Client extends Eris {
    constructor(token, options) {
        super(token, options);
        this.userData = new Enmap({
            provider: new PersistentCollection({
                name: 'userData'
            })
        });
        this.guildData = new Enmap({
            provider: new PersistentCollection({
                name: 'guildData'
            })
        });
        this.backups = new Enmap({
            provider: new PersistentCollection({
                name: 'backups'
            })
        });
        this.clientData = new Enmap({
            provider: new PersistentCollection({
                name: 'clientData'
            })
        });
        this.maintenance = false; //If true, bot will be locked to owner only
        this.talkedRecently = new Set(); //Cooldown stuff kek
        this.ratelimited = new Set();
        this.commands = new Eris.Collection();
        this.aliases = new Eris.Collection();
        this.config = config;
        this.commandsUsed = 0;

        this.defaultUserData = function(id) {
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

        this.defaultGuildData = function(id) {
            return {
                id: id,
                generalSettings: {
                    autoAssignablesRoles: [],
                    modLog: [],
                    prefix: config.prefix,
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
    }
}

const Felix = new Client(config.token, {
    disableEvents: {
        TYPING_START: true
    },
    maxShards: 2
});

(async function() {
    let errors = [];
    //Load the database
    logger.draft(`loadingDatabase`, `create`, `Loading the database...`);
    await Felix.userData.defer;
    await Felix.guildData.defer;
    //Launch database auto-update
    logger.draft(`loadingDatabase`, `edit`, `Fully loaded the database, launching database auto-update...`);
    await sleep(5000); //defer isn't accurate so we wait a bit more   
    const DatabaseUpdater = require(`./util/helpers/DatabaseUpdater.js`);
    const dbUpdate = await DatabaseUpdater.updateDatabase(Felix);
    logger.draft(`loadingDatabase`, `end`, `${dbUpdate.usersUpdate.entriesUpdated || dbUpdate.usersUpdate.entriesUpdated === 0 ? "Updated " + dbUpdate.usersUpdate.entriesUpdated + " user entries in " + dbUpdate.usersUpdate.time  + "ms" : "Failed to update user database: " + dbUpdate.usersUpdate}, ${dbUpdate.guildsUpdate.entriesUpdated || dbUpdate.guildsUpdate.entriesUpdated === 0 ? "and updated " + dbUpdate.guildsUpdate.entriesUpdated + " guild entries in " + dbUpdate.guildsUpdate.time + "ms": "Failed to update guild database: " + dbUpdate.guildsUpdate}`, dbUpdate.guildsUpdate.entriesUpdated && dbUpdate.usersUpdate.entriesUpdated ? true : false);
    //Load commands
    logger.draft(`loadingCommands`, `create`, `Loading commands...`);
    const categories = await fs.readdir(`./commands`);
    if (!Felix.clientData.has('commandsStats')) Felix.clientData.set('commandsStats', {});
    let commandsStats = Felix.clientData.get('commandsStats');
    let totalCommands = 0;
    for (let i = 0; i < categories.length; i++) {
        let thisCommands = await fs.readdir(`./commands/${categories[i]}`);
        totalCommands = totalCommands + thisCommands.length;
        thisCommands.forEach(c => {
            try {
                let command = require(`./commands/${categories[i]}/${c}`);
                command.uses = 0;
                //Set default conf if no conf provided
                if (!command.conf) command.conf = { guildOnly: false, disabled: false, aliases: false }
                command.conf.guildOnly = command.conf.guildOnly ? command.conf.guildOnly : false;
                command.conf.aliases = command.conf.aliases ? command.conf.aliases : false;
                command.conf.disabled = command.conf.disabled ? command.conf.disabled : false;
                if (!command.help.category) command.help.category = categories[i];
                //Add the command to the collection
                Felix.commands.set(command.help.name, command);
                if (!commandsStats[command.help.name]) commandsStats[command.help.name] = 0;
                if (!command.conf || !command.conf.aliases) return;
                command.conf.aliases.forEach(alias => {
                    Felix.aliases.set(alias, command.help.name);
                });
            } catch (err) {
                errors.push((`Failed to load command ${c}: ${err}`));
            }
        });
    }
    Felix.clientData.set('commandsStats', commandsStats);
    logger.draft(`loadingCommands`, `end`, `Loaded ${Felix.commands.size}/${totalCommands} commands`, true);
    //Load events
    logger.draft(`loadingEvents`, `create`, `Loading events...`);
    const events = await fs.readdir(`./events`);
    let loadedEvents = 0;
    events.forEach(e => {
        try {
            const eventName = e.split(".")[0];
            const event = require(`./events/${e}`);
            loadedEvents++;
            Felix.on(eventName, event.bind(null, Felix));
            delete require.cache[require.resolve(`./events/${e}`)];
        } catch (err) {
            errors.push(console.error(`Failed to load event ${e}: ${err}`));
        }
    });
    logger.draft(`loadingEvents`, `end`, `Loaded ${loadedEvents}/${events.length} events`, true);

    await sleep(1500);
    errors.forEach(e => console.error(e));

    process.on(`unhandledRejection`, err => Felix.emit('error', err));
    process.on(`uncaughtException`, err => Felix.emit('error', err));
    process.on(`error`, err => Felix.emit('error', err));

    //And this is where Felix manage the /config/core-data.json backup

    const backupManager = require(`./util/helpers/backupManager.js`);

    const coreData = await fs.readFile('./config/core-data.json');
    try {
        Felix.coreData = JSON.parse(coreData);
        logger.draft(`backupCore`, 'create', `Creating a backup of config/core-data.json...`);
        backupManager.createBackup(Felix, `./config/core-data.json`)
            .then(() => logger.draft(`backupCore`, `end`, `Successfully created a backup of config/core-data.json`, true))
            .catch(err => logger.draft(`backupCore`, `end`, `Failed to create a backup of core-data.json: ${err}`, false));
    } catch (err) {
        logger.draft('coreDataCorrupted', 'create', `Core data seems to be corrupted, attempting to restore from the backup...`);
        if (!Felix.backups.has('core-data')) logger.draft('coreDataCorrupted', 'end', `Core data (config/core-data.json) seems to be corrupted but no backup was found to restore it`);
        else {
            backupManager.loadBackup(Felix, `./config/core-data.json`)
                .then(() => {
                    Felix.coreData = JSON.parse(coreData);
                    logger.draft('coreDataCorrupted', 'end', 'Succeed to restore core-data from the backup', true);
                })
                .catch(err => logger.draft('coreDataCorrupted', 'end', `Failed to restore config/core-data from the backup: ${err}`, false));
        }
    }

    //Server and endpoints launch
    logger.draft(`serverLaunch`, `create`, `Launching server and initializing endpoints...`);
    let server = require(`./api/server.js`);
    const serverLaunch = await server.launch(Felix);
    Felix.server = serverLaunch;
    logger.draft('serverLaunch', 'end', `Server endpoints launched ${!Felix.server ? '' : 'at ' + Felix.server.info.uri}`, !Felix.server ? false : true);

    Felix.connect();

    //This is where Felix checks for API keys and disable features if missing keys
    if (!config.raven) logger.log(`No raven link found in the config, errors will be logged to the console`, "warn");
    if (!config.discordBotList) {
        let requireDiscordBotList = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("discordBotList"));
        requireDiscordBotList.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`discordBotList\` API key which is missing`);
        logger.log(`No discord bot list API key found in the config, disabled ${requireDiscordBotList.size > 0 ? requireDiscordBotList.map(c => c.help.name).join(", ") : "nothing"}`, `warn`);
    }
    if (!config.wolkeImageKey) {
        let requirewolkeImageKey = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("wolkeImageKey"));
        requirewolkeImageKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`wolkeImageKey\` API key which is missing`);
        logger.log(`No weeb.sh API key found in the config, disabled: ${requirewolkeImageKey.map(c => c.help.name).join(", ")}`, `warn`);
    }
    if (!config.mashapeKey) {
        let requiremashapeKey = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("mashapeKey"));
        requiremashapeKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`mashapeKey\` API key which is missing`);
        logger.log(`No mashape key API key found in the config, disabled ${requiremashapeKey.map(c => c.help.name).join(", ")}`, `warn`);
    }
    if (!config.malCredentials || !config.malCredentials.password || !config.malCredentials.name) {
        let requiremalCredentials = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("malCredentials"));
        requiremalCredentials.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`malCredentials\` name and password fields which are missing`);
        logger.log(`No MyAnimeList credentials found in the config, disabled ${requiremalCredentials.map(c => c.help.name).join(", ")}`, `warn`);
    }
    if (!config.rapidApiKey) {
        let requirerapidApiKey = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("rapidApiKey"));
        requirerapidApiKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`rapidApiKey\` API key which is missing`);
        logger.log(`No rapid API API (yes, they're named rapidAPI so i have to write two times API, don't hurt me pls) key found in the config, disabled ${requirerapidApiKey.size > 0 ? requirerapidApiKey.map(c => c.help.name).join(", ") : "nothing"}`, `warn`);
    }
    if (!config.steamApiKey) {
        let requiresteamApiKey = Felix.commands.filter(c => c.conf.require && c.conf.require.includes("steamApiKey"));
        requiresteamApiKey.forEach(c => Felix.commands.get(c.help.name).conf.disabled = `This command requires the \`steamApiKey\` API key which is missing`);
        logger.log(`No Steam API key found in the config, disabled ${requiresteamApiKey.size > 0 ? requiresteamApiKey.map(c => c.help.name).join(", ") : "nothing"}`, `warn`);
    }

}());