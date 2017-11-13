const Enmap = require("enmap");
const PersistentCollection = require('enmap-level');
const fs = require(`fs-extra`);
const config = JSON.parse(fs.readFileSync(`./config/config.json`));
const sleep = require(`./util/modules/sleep.js`);
const logger = require("./util/modules/logger.js");

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

const Eris = require("Eris");

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
        this.maintenance = false; //If true, bot will be locked to owner only
        this.talkedRecently = new Set(); //Cooldown stuff kek
        this.ratelimited = new Set();
        this.commands = new Eris.Collection();
        this.aliases = new Eris.Collection();
        this.config = config;
        this.commandsUsed = 0;
        this.upvotes = {
            users: false,
            latestUpdate: Date.now(),
            count: function() {
                return this.users.length
            }
        }
        this.statsUpdate = {
            success: {
                name: 'No Data',
                message: 'Server count hasn\'t been sent yet',
                description: function() {
                    return `${this.name}: ${this.message}`;
                }
            },
            latestUpdate: false
        }
        this.imageTypes = {
            success: {
                name: 'No Data',
                message: `The weeb's image types didn't got fetched yet`,
                description: function() {
                    return `${this.name}: ${this.message}`;
                }
            },
            latestUpdate: Date.now()
        }

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
    logger.draft(`loadingDatabase`, `create`, `Loading the database...`);
    await Felix.userData.defer;
    logger.draft(`loadingDatabase`, `end`, `Fully loaded the database`, true);
    logger.draft(`loadingCommands`, `create`, `Loading commands...`);
    const commands = await fs.readdir(`./commands`);
    commands.forEach(c => {
        try {
            let command = require(`./commands/${c}`);
            c.uses = 0;
            Felix.commands.set(command.help.name, command);
            if (!command.conf.aliases) return;
            command.conf.aliases.forEach(alias => {
                Felix.aliases.set(alias, command.help.name);
            });
        } catch (err) {
            errors.push((`Failed to load command ${c}: ${err}`));
        }
    });
    logger.draft(`loadingCommands`, `end`, `Loaded ${Felix.commands.size}/${commands.length} commands`, true);
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

    process.on(`unhandledRejection`, err => Felix.emit('fail', err));
    process.on(`uncaughtException`, err => Felix.emit('fail', err));
    process.on(`error`, err => Felix.emit('fail', err));

    if (!config.raven) console.log(`No raven link found in the config, errors will be logged to the console`);

    Felix.connect();
}());