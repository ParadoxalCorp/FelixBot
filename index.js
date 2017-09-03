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
var Raven = require('raven');
Raven.config('https://d020274d33f942b7a581a5ccdc001d95:ed66eada85454353bdd4af15841e5d51@sentry.io/210885').install();

const dbPath = "database/database.json";
const PersistentCollection = require('djs-collection-persistent');

const database = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

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
client.config = database.Data.global[0];
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

//require node 8 or higher
(async function() {

    // Here we load commands into memory, as a collection, so they're accessible everywhere
    const files = await readdir('./commands/');
    console.log(`------------------------------------------------------------------------\nLoading a total of ${files.length} commands.`);
    files.forEach(f => {
        try {
            const props = require(`./commands/${f}`);
            console.log(`Loading Command: ${props.help.name}. 👌`);
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
        } catch (e) {
            console.log(`Unable to load command ${f}: ${e.stack}`);
        }
    });
    try { //Build the help on launch instead of everytime the help is triggered to decrease the ressources usage
        console.log("Building the help...");
        const categories = ["generic", "miscellaneous", "image", "utility", "fun", "moderation", "settings"];
        var i;
        for (i = 0; i < categories.length; i++) {
            const categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
            client.overallHelp += `**${categories[i]}** =>`;
            client.overallHelp += categoryCommands.map(c => `\`${c.help.name}\` `);
            client.overallHelp += "\n\n";
        }
        client.overallHelp = client.overallHelp.replace(/undefined/gim, ""); //To remove the "undefined"
        console.log("Success !");
        //console.log(client.overallHelp);
    } catch (err) {
        console.error(`[ERROR] => Failed to build the help: ${err.stack}`);
    }
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