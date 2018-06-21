'use strict';

const { inspect } = require('util');

class ErrorHandler {
    constructor() {
        this.discordErrorCodes = {
            '10018': {
                message: false,
                discard: true
            },
            '50001': {
                message: 'I don\'t have enough permissions to perform this action',
                discard: true
            },
            '50007': {
                message: 'I tried to send a DM but you/the given user have your/their DMs disabled',
                discard: true
            },
            '50013': {
                message: 'I don\'t have enough permissions to perform this action',
                discard: true
            },
        };
        this.sentry;
    }

    async handle(client, err, message) {
        if (typeof this.sentry === 'undefined' && client.config.apiKeys.sentryDSN) {
            this.initSentry(client);
        }
        const error = typeof err === 'string' ? this.identifyError(err) : false;
        if (typeof err === 'object') {
            err = inspect(err, {depth: 5});
        }
        process.send({ name: 'error', msg: `Error: ${err}\nStacktrace: ${err.stack}\nMessage: ${message ? message.content : 'None'}` });
        if (message) {
            if (client.config.admins.includes(message.author.id)) {
                message.channel.createMessage({
                    embed: {
                        title: ':x: An error occurred',
                        description: '```js\n' + (err.stack || err) + '```'
                    }
                }).catch(() => {});
            } else {
                message.channel.createMessage({
                    embed: {
                        title: ':x: An error occurred :v',
                        description: error ? `${error.message}\n\nFor more information, don't hesitate to join the [support server](<https://discord.gg/Ud49hQJ>)` : 'This is most likely because i lack the permission to do that. However, if the issue persist, this might be a bug. In that case, please don\'t hesitate to join the [support server](<https://discord.gg/Ud49hQJ>) and report it'
                    }
                }).catch(() => {});
            }
        }
        if (this.sentry && (!error || (error && !error.discard))) {
            this.sentry.captureException(err, {
                release: client.package.version,
                extra: {
                    message: message ? message.content : 'None',
                    guild: message && message.channel.guild ? `${message.channel.guild.name} | ${message.channel.guild.id}` : 'None',
                    cluster: client.clusterID
                }
            });
        }
    }

    identifyError(err) {
        for (const key in this.discordErrorCodes) {
            if (err.includes(key)) {
                return this.discordErrorCodes[key];
            }
        }
        return false;
    }

    initSentry(client) {
        let raven;
        try {
            raven = require('raven');
        } catch (err) {} //eslint-disable-line no-empty
        if (!raven) {
            return this.sentry = false;
        }
        this.sentry = raven.config(client.config.apiKeys.sentryDSN, {
            environment: client.config.process.environment,
            release: client.package.version
        }).install();
    }
}

module.exports = new ErrorHandler();