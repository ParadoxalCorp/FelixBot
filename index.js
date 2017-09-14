const Discord = require("discord.js");
const client = new Discord.Client({
    disabledEvents: ["TYPING_START"]
});

const fs = require("fs-extra");
const unirest = require("unirest");
const { Wit, log } = require('node-wit');

const wit = new Wit({
    accessToken: "VBDY3FZZCLSQMISZNLUGQYG4EQCTKTQI",
});

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
(async function() {
    const clientFunctions = await readdir('./modules/clientFunctions');
    console.log(`----------------------------------------------------------------------------------------------\nLoading a total of ${clientFunctions.length} functions.`);
    clientFunctions.forEach(f => {
        try {
            const props = require(`./modules/clientFunctions/${f}`)(client);
            console.log(`Loading function: ${f}. 👌`);
        } catch (e) {
            console.log(`Unable to load function ${f}: ${e.stack}`);
        }
    });
}());
//Load malsearch module
try {
    require("./modules/malsearch.js")(client);
    console.log("[INFO] => Malsearch module loaded");
} catch (err) {
    console.error("[ERROR] => Failed to load the malsearch module: " + err.stack);
}
client.mention = "<@343527831034265612>";
client.config = database;
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.database = database;
client.dbPath = dbPath;
client.errorLog = "328847359100321792";
client.featureChan = "328843222837362689";
client.bugChan = "328843250687279105";
client.overallHelp; //Will get initialized later
client.cmdsUsed = 0; //Will contain the count of commands used since restart
client.cmdsLogs; //Will get initialized in the message event
client.userData = userData;
client.guildData = guildData;
client.tagData = tagData;
client.clientData = clientData;
client.talkedRecently = new Set(); //cooldown stuff
client.wit = wit;
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
        message: `The weeb's image types didnt got fetched yet`,
        description: function() {
            return `${this.name}: ${this.message}`;
        }
    },
    latestUpdate: Date.now()
}

client.defaultUserData = function(id) {
    return {
        id: id,
        cooldowns: {},
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
                }]
            }
        },
        dataPrivacy: {
            publicLevel: true,
            publicProfile: true,
            publicLove: true,
            publicPoints: true
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
                enabled: true,
                public: true,
                levelUpNotif: false,
                roles: [],
                users: [],
                totalExp: 0
            },
        },
        permissionsLevels: {
            things: [
                [],
                [],
                []
            ],
            globalLevel: "none"
        },
        onEvent: {
            guildMemberAdd: {
                onJoinRole: [],
                greetings: {
                    enabled: false,
                    message: false,
                    embed: false,
                    method: false,
                    channel: false,
                    error: false //Will be used for missing permissions case
                }
            },
            guildMemberRemove: {
                farewell: {
                    enabled: false,
                    message: false,
                    embed: false,
                    channel: false,
                    error: false //Will be used for missing permissions case
                }
            }
        }
    }
}

process.on('uncaughtException', (err) => {
    try {
        console.error(err);
    } catch (err) {
        return;
    }
});
process.on("unhandledRejection", err => {
    try {
        console.error(err);
        if (err.message === "Missing Permissions") {
            return;
        }
        Raven.captureException(err);
    } catch (err) {
        return;
    }
});
process.on("error", err => {
    try {
        console.error(err);
        client.channels.get(client.errorLog).send("**Error: " + err + err.stack);
    } catch (err) {
        console.error(err);
        return;
    }
});
setTimeout(async function() {
    client.loadReminders(); //Launch reminders loading
}, 7500); //Wait for the db to be properly loaded

setTimeout(async function() {
    client.updateDatabase(client); //Update database
}, 7500);

//require node 8 or higher
(async function() {

    // Here we load commands into memory, as a collection, so they're accessible everywhere
    const files = await readdir('./commands/');
    console.log(`------------------------------------------------------------------------\nLoading a total of ${files.length} commands.`);
    files.forEach(f => {
        try {
            const props = require(`./commands/${f}`);
            console.log(`Loading Command: ${props.help.name}. 👌`);
            props.uses = 0; //For stats purposes
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
        } catch (e) {
            console.log(`Unable to load command ${f}: ${e.stack}`);
        }
    });
    const categories = ["generic", "miscellaneous", "image", "utility", "fun", "moderation", "settings"];
    for (let i = 0; i < categories.length; i++) {
        const categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
        client.overallHelp += `**${categories[i]}** =>` + categoryCommands.map(c => `\`${c.help.name}\` `) + "\n\n";
    }
    client.overallHelp = client.overallHelp.replace(/undefined/gim, ""); //To remove the "undefined"
    const evtFiles = await readdir('./events/');
    console.log(`Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
        const eventName = file.split(".")[0];
        const event = require(`./events/${file}`);
        // This line is awesome by the way. Just sayin'.
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
    client.login(client.config.token);
}());