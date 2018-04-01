'use strict';

const fs = require('fs');
const { join } = require('path');
const { Base } = require('eris-sharder');

class Felix extends Base {
    constructor(bot) {
        super(bot);

        //If true, this would ignore all messages from everyone besides the owner
        this.maintenance = false;
        this.Collection = require('./util/helpers/Collection');
        //A collection that will contain users in cooldown/near the cooldown
        this.ratelimited = new this.Collection();
        //This will be filled with mentions prefix once ready
        this.commands = new this.Collection();
        this.aliases = new this.Collection();
        this.log = require('./util/modules/log');
        this.config = require('./config');
        this.sleep = require(`./util/modules/sleep.js`);
        this.prefixes = this.config.prefix ? [this.config.prefix] : [];
        this.database = process.argv.includes('--no-db') ? false : new(require('./util/helpers/DatabaseWrapper'))(this);
        this.refs = require('./util/helpers/references');
    }

    launch() {
        this.loadCommands();
        this.loadEventsListeners();
        this.bot.on('ready', this.ready.bind(this));
        this.MessageCollector = new(require('./util/helpers/MessageCollector'))(this.bot);

        this.ready();
    }

    loadCommands() {

        this.log.info(`Loading commands..`);
        const categories = fs.readdirSync(join(__dirname, 'commands'));
        let totalCommands = 0;
        for (let i = 0; i < categories.length; i++) {
            let thisCommands = fs.readdirSync(join(__dirname, 'commands', categories[i]));
            totalCommands = totalCommands + thisCommands.length;
            thisCommands.forEach(c => {
                try {
                    const command = require(join(__dirname, 'commands', categories[i], c));
                    //Add the command and its aliases to the collection
                    if (!process.argv.includes('--no-db') || !command.conf.requireDB) {
                        this.commands.set(command.help.name, command);
                        command.conf.aliases.forEach(alias => {
                            this.aliases.set(alias, command.help.name);
                        });
                    }
                } catch (err) {
                    this.log.error(`Failed to load command ${c}: ${err.stack || err}`);
                }
            });
        }
        this.log.info(`Loaded ${this.commands.size}/${totalCommands} commands`);
    }

    loadEventsListeners() {
        //Load events
        this.log.info(`Loading events..`);
        const events = fs.readdirSync(join(__dirname, 'events'));
        let loadedEvents = 0;
        events.forEach(e => {
            try {
                const eventName = e.split(".")[0];
                const event = require(join(__dirname, 'events', e));
                loadedEvents++;
                this.bot.on(eventName, event.bind(null, this));
                delete require.cache[require.resolve(join(__dirname, 'events', e))];
            } catch (err) {
                this.log.error(`Failed to load event ${e}: ${err.stack || err}`);
            }
        });
        this.log.info(`Loaded ${loadedEvents}/${events.length} events`);
    }

    async ready() {
        await this.sleep(1000); //Wait for the data to be loaded into the client
        if (!this.bot.user.bot) {
            this.log.error(`Invalid login details were provided, the process will exit`);
            process.exit(0);
        }
        this.prefixes.push(`<@!${this.bot.user.id}>`, `<@${this.bot.user.id}>`);
        this.log.info(`Logged in as ${this.bot.user.username}#${this.bot.user.discriminator}, running Felix ${require('./package').version}`);
        await this.sleep(1000);
        console.log(`\n===============================================\nGuilds: ${this.bot.guilds.size}\nUsers: ${this.bot.users.size}\nPrefix: ${this.config.prefix}\n===============================================`);
        this.bot.shards.forEach(s => {
            s.editStatus("online", {
                name: `${this.config.prefix} help for commands | Shard ${s.id}`
            });
        });
    }
}

module.exports = Felix;