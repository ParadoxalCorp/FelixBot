'use strict';

const Command = require('../../util/helpers/modules/Command');

class Love extends Command {
    constructor() {
        super();
        this.help = {
            name: 'love',
            description: 'Love someone, bring some love to this world !',
            usage: 'love <user_resolvable>',
            category: 'fun'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['luv'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: []
        };
    }

    async run(client, message, args, guildEntry, userEntry) {
        if (!args[0]) {
            let remainingLps = this.getRemainingLps(userEntry);
            if (!remainingLps) {
                const remainingTime = client.timeConverter.toElapsedTime(userEntry.getNearestCooldown('loveCooldown') - Date.now());
                return message.channel.createMessage(`:x: You already used all your love points, time remaining: ${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`);
            }
            return message.channel.createMessage(`You have \`${remainingLps}\` love point(s) available`);
        } else if (userEntry.isInCooldown('loveCooldown')) {
            const remainingTime = client.timeConverter.toElapsedTime(userEntry.getNearestCooldown('loveCooldown') - Date.now());
            return message.channel.createMessage(`:x: You already used all your love points, time remaining: ${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`);
        }
        const targetUser = await this.getUserFromText({ client: client, message: message, text: args.join(' ') });
        if (!targetUser) {
            return message.channel.createMessage(`:x: I couldn't find the user you specified :v`);
        } else if (targetUser.id === message.author.id) {
            return message.channel.createMessage(`:x: Trying to love yourself eh? :eyes:`);
        }
        const targetEntry = await client.database.getUser(targetUser.id);
        targetEntry.love.amount++;
        userEntry.addCooldown('loveCooldown', client.config.options.loveCooldown);
        await Promise.all([client.database.set(userEntry, 'user'), client.database.set(targetEntry, 'user')]);
        return message.channel.createMessage(`:heart: Haii ! You just gave **1** love point to **${client.extendedUser(targetUser).tag}**`);
    }

    getRemainingLps(userEntry) {
        const cooldownObj = userEntry.cooldowns.loveCooldown;
        let remainingLps = cooldownObj.max - cooldownObj.cooldowns.length; //In case the user is new and hasn't received the max cooldowns yet
        for (const cooldown of cooldownObj.cooldowns) {
            if (cooldown < Date.now()) {
                remainingLps++;
            }
        }
        return remainingLps;
    }
}

module.exports = new Love();