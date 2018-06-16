'use strict';

const Command = require('../../util/helpers/modules/Command');

class SetGreetings extends Command {
    constructor() {
        super();
        this.extra = {
            possibleActions: [{
                name: 'enable',
                func: this.enable.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }, {
                name: 'disable',
                func: this.disable.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }, {
                name: 'set_message',
                func: this.setMessage.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }, {
                name: 'set_message_target',
                func: this.setMessageTarget.bind(this),
                interpretAs: '{value}',
                expectedArgs: 1
            }, {
                name: 'see_settings',
                func: this.seeSettings.bind(this),
                interpretAs: '{value}',
                expectedArgs: 0
            }]
        };
        this.help = {
            name: 'setgreetings',
            category: 'settings',
            description: 'This command allows you to change the settings of the greetings system',
            usage: '{prefix}setgreetings',
            externalDoc: 'https://github.com/ParadoxalCorp/FelixBot/blob/frosty-release/greetings-farewell.md'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['greetings'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [{
                description: 'Please specify the action you want to do in the following possible actions: ' + this.extra.possibleActions.map(a => `\`${a.name}\``).join(', '),
                possibleValues: this.extra.possibleActions
            }, {
                //Conditional set_message_target branch
                condition: (client, message, args) => args.includes('set_message_target'),
                description: 'Please specify the target of the greetings messages, specify `#<channel_name>` or `<channel_name>` to send them in a specific channel or `dm` to send them directly to the member who just joined',
                possibleValues: [{
                    name: '*',
                    interpretAs: '{value}'
                }]
            }, {
                //Conditional set_message branch
                condition: (client, message, args) => args.includes('set_message'),
                description: `Please specify the greetings message you want to be sent whenever a new user join the server, check <${this.help.externalDoc}> for more information and a list of tags you can use`
            }]
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        const action = this.extra.possibleActions.find(a => a.name === args[0]);
        const getPrefix = client.commands.get('help').getPrefix;
        if (!action) {
            return message.channel.createMessage(`:x: The specified action is invalid, if you are lost, simply run the command like \`${getPrefix(client, guildEntry)}${this.help.name}\``);
        }
        //If the command isn't ran without args and the args aren't what's expected, to not conflict with the skipping in conditions 
        if (message.content.split(/\s+/g).length !== 2 && (action.expectedArgs > args.length - 1)) {
            return message.channel.createMessage(`:x: This action expect \`${action.expectedArgs - (args.length - 1)}\` more argument(s), if you are lost, simply run the command like \`${getPrefix(client, guildEntry)}${this.help.name}\``);
        }
        return action.func(client, message, args, guildEntry, userEntry);
    }

    async enable(client, message, args, guildEntry) {
        if (!guildEntry.greetings.enabled) {
            guildEntry.greetings.enabled = true;
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(':white_check_mark: Alright, the greetings are now enabled. Make sure to also set up a greetings message and the target');
        } else {
            return message.channel.createMessage(':x: The greetings are already enabled');
        }
    }

    async disable(client, message, args, guildEntry) {
        if (guildEntry.greetings.enabled) {
            guildEntry.greetings.enabled = false;
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(':white_check_mark: Alright, the greetings are now disabled');
        } else {
            return message.channel.createMessage(':x: The greetings are already disabled');
        }
    }

    async setMessageTarget(client, message, args, guildEntry) {
        if (args[1].toLowerCase() === 'dm') {
            if (guildEntry.greetings.channel === args[1].toLowerCase()) {
                return message.channel.createMessage(`:x: The greetings target is already set to \`${args[1].toLowerCase()}\``);
            }
            guildEntry.greetings.channel = args[1].toLowerCase();
            await client.database.set(guildEntry, 'guild');
            return message.channel.createMessage(`:white_check_mark: Alright, the greetings target has been updated`);
        }
        const channel = await this.getChannelFromText({ client: client, message: message, text: args[1] });
        if (!channel) {
            return message.channel.createMessage(`:x: I couldn't find a channel named \`${args[1]}\` on this server`);
        } else if (guildEntry.greetings.channel === channel.id) {
            return message.channel.createMessage(`:x: The greetings target is already set to the channel <#${channel.id}>`);
        }
        guildEntry.greetings.channel = channel.id;
        await client.database.set(guildEntry, 'guild');
        const hasPerm = Array.isArray(this.clientHasPermissions(message, client, ['sendMessages'], channel)) ? false : true;
        return message.channel.createMessage(`:white_check_mark: Alright, the greetings target has been set to the channel <#${channel.id}>` + (!hasPerm ? `\n\n:warning: It seems like i don\'t have enough permissions to send messages in <#${channel.id}>, you may want to fix that` : ''));
    }

    async setMessage(client, message, args, guildEntry) {
        if (!args[1]) {
            return message.channel.createMessage(':x: You must specify the new greetings message to use');
        }
        guildEntry.greetings.message = args[2] ? args.join(' ') : args[1];
        await client.database.set(guildEntry, 'guild');
        return message.channel.createMessage(':white_check_mark: Alright, the greetings message has been updated');
    }

    async seeSettings(client, message, args, guildEntry) {
        return message.channel.createMessage({
            embed: {
                title: ':gear: Current greetings settings',
                description: 'Greetings message: ```\n' + (guildEntry.greetings.message.length > 1950 ? guildEntry.greetings.message.substr(0, 1950) + '...' : guildEntry.greetings.message) + '```',
                fields: [{
                    name: 'Greetings',
                    value: guildEntry.greetings.enabled ? 'Enabled :white_check_mark:' : 'Disabled :x:',
                    inline: true
                }, {
                    name: 'Greetings target',
                    value: guildEntry.greetings.channel ? (guildEntry.greetings.channel === 'dm' ? 'dm' : `<#${guildEntry.greetings.channel}>`) : 'Not set :x:'
                }, {
                    name: 'Permissions',
                    value: this._checkPermissions(client, message, guildEntry)
                }],
                color: client.config.options.embedColor
            }
        });
    }

    _checkPermissions(client, message, guildEntry) {
        let result = '';
        const channel = message.channel.guild.channels.get(guildEntry.greetings.channel);
        if (channel) {
            result += Array.isArray(this.clientHasPermissions(message, client, ['sendMessages'], channel)) ? `:warning: I don't have enough permissions to send messages in <#${channel.id}>\n` : '';
        }
        if (!result) {
            result = ':white_check_mark: No permissions issues have been detected with the current settings';
        }
        return result;
    }
}

module.exports = new SetGreetings();