const Discord = require("discord.js");
const client = new Discord.Client({
    disabledEvents: ["TYPING_START"]
});
const fs = require("fs-extra");
const unirest = require("unirest");
const dbPath = "database/database.json";
const database = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
const PersistentCollection = require('djs-collection-persistent');
//const memwatch = require("memwatch-next");
//const heapdump = require("heapdump");
const {
    promisify
} = require('util');
const readdir = promisify(require("fs-extra").readdir);

//Database initialization
const userDatas = new PersistentCollection({
    name: 'userDatas'
});
console.log("[INFO] Users database loaded");
const guildDatas = new PersistentCollection({
    name: 'guildDatas'
});
console.log("[INFO] Guilds database loaded");
const tagDatas = new PersistentCollection({
    name: 'tagDatas'
});
console.log("[INFO] Tags database loaded");
//Load functions
try {
    require("./modules/functions.js")(client);
    console.log("[INFO] => Loaded functions");
} catch (err) {
    console.error("[ERROR] => Failed to load functions: " + err.stack);
}
//Load malsearch module
try {
    require("./modules/malsearch.js")(client);
    console.log("[INFO] => Malsearch module loaded");
} catch (err) {
    console.error("[ERROR] => Failed to load the malsearch module: " + err.stack);
}
client.mention = `<@327144735359762432>`;
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
client.userDatas = userDatas;
client.guildDatas = guildDatas;
client.tagDatas = tagDatas;

process.on('uncaughtException', (err) => {
    try {
        console.error(err);
        if (err === "DiscordAPIError: Missing Permissions") {
            return;
        }
        client.channels.get(client.errorLog).send("Uncaught Exception: " + err + "\n**Detailled log:** " + err.stack);
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
        client.channels.get(client.errorLog).send("**Unhandled Rejection: " + err + "\n**Detailled log:** " + err.stack);
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


//require node 8 or higher
(async function () {

    // Here we load commands into memory, as a collection, so they're accessible everywhere
    const files = await readdir('./commands/');
    console.log(`Loading a total of ${files.length} commands.`);
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
        const categories = ["generic", "image", "utility", "fun", "moderation", "settings"];
        var i;
        for (i = 0; i < categories.length; i++) {
            const categoryCommands = client.commands.filter(c => c.help.category == categories[i]);
            client.overallHelp += `**${categories[i]}** =>`
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
