'use strict';

const config = require('./config');
const log = require('./util/modules/log');
const Collection = require('./util/helpers/Collection');
const Eris = require('eris');
const fs = require('fs');
const sleep = require('./util/modules/sleep');

if (!config.token) {
    log.error('No token is specified in the config, launch aborted');
    process.exit(0);
}

process.on(`unhandledRejection`, err => log.error(err.stack || err));
process.on(`uncaughtException`, err => log.error(err.stack || err));
process.on(`error`, err => log.error(err.stack || err));

class Yuuri extends Eris {
    constructor(token, options) {
        super(token, options);
        //If true, this would ignore all messages from everyone besides the owner
        this.maintenance = false;
        //A collection that will contain users in cooldown/near the cooldown
        this.ratelimited = new Collection();
        //This will be filled with mentions prefix once ready
        this.prefixes = config.prefix ? [config.prefix] : [];
        this.commands = new Collection();
        this.aliases = new Collection();
        this.config = config;
        this.database = process.argv.includes('--no-db') ? false : new(require('./util/helpers/DatabaseWrapper'))(this);
        this.refs = require('./util/helpers/references');
        this.MessageCollector = new(require('./util/helpers/MessageCollector'))(this);
    }
}

const client = new Yuuri(config.token, {
    disableEvents: {
        TYPING_START: true
    },
    messageLimit: 50,
    defaultImageSize: 2048,
    maxShards: 'auto'
});

(async function() {
    //This part handle the connection to the database and setup the database if its the first run
    //Unless the --no-db parameter is specified when running the program
    if (!process.argv.includes('--no-db')) {
        log.draft('settingDb', 'Setting up the database..');
        await client.database.createDatabase('data')
            .catch(err => {
                log.error(`Failed to create the database "data": ${err}`);
            });
        const tables = ['users', 'guilds'];
        for (let i = 0; i < tables.length; i++) {
            await client.database.createTable(tables[i], 'data')
                .catch(err => {
                    log.error(`Failed to create the table "${tables[i]}" in the database "data": ${err}`);
                });
        }
        log.endDraft('settingDb', 'The database is all set');
        client.database.init()
            .catch(err => {
                log.error(`An error occurred when initializing the background database wrapper: ${err}`);
            });
    }

    //Load the commands
    log.draft('loadingCommands', `Loading commands..`);
    const categories = fs.readdirSync('./commands');
    let totalCommands = 0;
    for (let i = 0; i < categories.length; i++) {
        let thisCommands = fs.readdirSync(`./commands/${categories[i]}`);
        totalCommands = totalCommands + thisCommands.length;
        thisCommands.forEach(c => {
            try {
                const command = require(`./commands/${categories[i]}/${c}`);
                //Add the command and its aliases to the collection
                if (!process.argv.includes('--no-db') || !command.conf.requireDB) {
                    client.commands.set(command.help.name, command);
                    command.conf.aliases.forEach(alias => {
                        client.aliases.set(alias, command.help.name);
                    });
                }
            } catch (err) {
                log.error(`Failed to load command ${c}: ${err.stack || err}`);
            }
        });
    }
    log.endDraft('loadingCommands', `Loaded ${client.commands.size}/${totalCommands} commands`);

    //Load events
    log.draft('loadingEvents', `Loading events..`);
    const events = fs.readdirSync(`./events`);
    let loadedEvents = 0;
    events.forEach(e => {
        try {
            const eventName = e.split(".")[0];
            const event = require(`./events/${e}`);
            loadedEvents++;
            client.on(eventName, event.bind(null, client));
            delete require.cache[require.resolve(`./events/${e}`)];
        } catch (err) {
            log.error(`Failed to load event ${e}: ${err.stack || err}`);
        }
    });
    log.endDraft(`loadingEvents`, `Loaded ${loadedEvents}/${events.length} events`);

    client.connect();
}());