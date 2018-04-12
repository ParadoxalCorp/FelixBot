'use strict';

/**
 * Provides methods to reload events listeners, modules and commands
 * @prop {*} client - The client given in the constructor
 */
class Reloader {
    /**
     * @param {*} client - The client instance 
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Reload the command at the given path, or add it if it wasn't already here
     * @param {string} path - The absolute path to the command
     * @returns {Command} The reloaded command so calls can be chained 
     */
    reloadCommand(path) {
        delete require.cache[path];
        const command = require(path);

        if ((!this.client.database || !this.client.database.healthy) && command.conf.requireDB) {
            command.conf.disabled = ":x: This command uses the database, however the database seems unavailable at the moment";
        }

        this.client.commands.set(command.help.name, command);
        this.client.aliases.filter(a => a === command.help.name).forEach(a => this.client.aliases.delete(a));
        command.conf.aliases.forEach(alias => this.client.aliases.set(alias, command.help.name));

        return command;
    }

    /**
     * Reload the event listener at the given path, or add it if it wasn't already here
     * @param {string} path - The absolute path to the event listener
     * @returns {string} The name of the event, parsed from the path
     */
    reloadEventListener(path) {
        const eventName = path.split(/\/|\\/gm)[path.split(/\/|\\/gm).length - 1].split('.')[0];
        delete require.cache[path];
        this.client.bot.removeAllListeners(eventName);
        this.client.bot.on(eventName, require(path).bind(null, this.client));
        return eventName;
    }

    /**
     * Reload the module at the given path, or add it if it wasn't already here
     * @param {string} path - The absolute path to the module
     * @param {string} name - The name of the module (file name)
     * @param {object} options - An object of options
     * @param {boolean|string} options.bindtoclient - Whether the module should be added as a property of the client class, can be true or a string which should be the name under which the module will go
     * @param {string} options.instantiate - Whether a non-instantiated class should be expected, "bot" will instantiate it with the eris bot class, "client" with the client instance
     * @returns {*} The reloaded module (and instantiated if needed), so calls can be chained
     */
    reloadModule(path, name, options) {
        delete require.cache[path];

        if (this.client[typeof options['bindtoclient'] === 'string' ? options['bindtoclient'] : name]) {
            delete this.client[typeof options['bindtoclient'] === 'string' ? options['bindtoclient'] : name];
            options['bindtoclient'] = typeof options['bindtoclient'] === 'string' ? options['bindtoclient'] : name;
        }

        const actualModule = options['instantiate'] ? new(require(path))(options['instantiate'] === 'client' ?
            this.client : (options['instantiate'] === 'bot' ? this.client.bot : false)) : require(path);

        if (options['bindtoclient']) {
            this.client[typeof options['bindtoclient'] === 'string' ? options['bindtoclient'] : name] = actualModule;
        }

        return actualModule;
    }
}

module.exports = Reloader;