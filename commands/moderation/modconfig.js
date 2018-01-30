class ModConfig {
    constructor() {
        this.help = {
            name: 'modconfig',
            usage: 'modconfig',
            description: 'This command lets you manage most of the moderation system settings'
        }
        this.conf = {
            guildOnly: true
        }
        this.shortcut = {
            triggers: new Map([
                ['toggle_auto_invite_filtering', {
                    script: 'toggleAutoInviteFiltering.js',
                    help: 'Toggle the automatic invites filtering, if enabled, Felix will automatically delete invites to servers that aren\'t this one or white-listed. Read more on the wiki',
                    usage: 'toggle_auto_invite_filtering'
                }],
                ['whitelist_guild', {
                    script: 'whitelistGuild.js',
                    help: 'Whitelist a guild with its ID, if the invites filtering is enabled, invites to white-listed guilds will not be deleted. If a already white-listed guild ID is specified, the guild be removed from the whitelist',
                    usage: 'whitelist_guild <guild ID>'
                }],
                ['toggle_auto_invite_filtering_warning', {
                    script: 'toggleAutoInviteFilteringWarning.js',
                    help: 'Toggle whether members should be automatically warned when they post an invite to another server',
                    usage: 'toggle_auto_invite_filtering_warning'
                }],
                ['settings', {
                    script: 'settings.js',
                    help: 'Display the current moderation settings on this server (white-listed guilds...)',
                    usage: 'settings'
                }],
                ['add_muted_role', {
                    script: 'addMutedRole.js',
                    help: 'Add a custom muted role, more information about custom muted roles on the wiki',
                    usage: 'add_muted_role <role resolvable>',
                    args: 1
                }],
                ['remove_muted_role', {
                    script: 'removeMutedRole.js',
                    help: 'Remove a custom muted role, more information about custom muted roles on the wiki',
                    usage: 'remove_muted_role <role resolvable>',
                    args: 1
                }],
                ['set_ads_warn_message', {
                    script: 'setAdsWarnMessage.js',
                    help: 'Set a custom warn message that is sent to the member whenever they are automatically warned for advertisement. Don\'t put any text to disable it. See a list of tags on the wiki',
                    usage: 'set_warn_message <text>',
                    args: 1
                }]
            ])
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const ModConfig = this;
                resolve(await message.channel.createMessage('Hoi, welcome to the general moderation settings panel, see below what you can do: ```css\n' + Array.from(ModConfig.shortcut.triggers.keys()).map(s =>
                    `${s} : ${ModConfig.shortcut.triggers.get(s).help}\nUsage example: ${client.guildData.get(message.guild.id).generalSettings.prefix + ModConfig.help.name + ' ' + ModConfig.shortcut.triggers.get(s).usage}\n\n`).join('\n') + '```'));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new ModConfig();