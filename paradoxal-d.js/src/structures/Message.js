const Mentions = require('./MessageMentions');
const Attachment = require('./MessageAttachment');
const Embed = require('./MessageEmbed');
const RichEmbed = require('./RichEmbed');
const MessageReaction = require('./MessageReaction');
const ReactionCollector = require('./ReactionCollector');
const Util = require('../util/Util');
const Collection = require('../util/Collection');
const Constants = require('../util/Constants');
const Permissions = require('../util/Permissions');
let GuildMember;

/**
 * Represents a message on Discord.
 */
class Message {
    constructor(channel, data, client) {
        /**
         * The client that instantiated the Message
         * @name Message#client
         * @type {Client}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The channel that the message was sent in
         * @type {TextChannel|DMChannel|GroupDMChannel}
         */
        this.channel = channel;

        if (data) this.setup(data);
    }

    setup(data) { // eslint-disable-line complexity
        /**
         * The ID of the message
         * @type {Snowflake}
         */
        this.id = data.id;

        /**
         * The type of the message
         * @type {string}
         */
        this.type = Constants.MessageTypes[data.type];

        /**
         * The content of the message
         * @type {string}
         */
        this.content = data.content;

        /**
         * The author of the message
         * @type {User}
         */
        this.author = this.client.dataManager.newUser(data.author);

        /**
         * Represents the author of the message as a guild member
         * Only available if the message comes from a guild where the author is still a member
         * @type {?GuildMember}
         */
        this.member = this.guild ? this.guild.member(this.author) || null : null;

        /**
         * Whether or not this message is pinned
         * @type {boolean}
         */
        this.pinned = data.pinned;

        /**
         * Whether or not the message was Text-To-Speech
         * @type {boolean}
         */
        this.tts = data.tts;

        /**
         * A random number or string used for checking message delivery
         * @type {string}
         */
        this.nonce = data.nonce;

        /**
         * Whether or not this message was sent by Discord, not actually a user (e.g. pin notifications)
         * @type {boolean}
         */
        this.system = data.type === 6;

        /**
         * A list of embeds in the message - e.g. YouTube Player
         * @type {MessageEmbed[]}
         */
        this.embeds = data.embeds.map(e => new Embed(this, e));

        /**
         * A collection of attachments in the message - e.g. Pictures - mapped by their ID
         * @type {Collection<Snowflake, MessageAttachment>}
         */
        this.attachments = new Collection();
        for (const attachment of data.attachments) this.attachments.set(attachment.id, new Attachment(this, attachment));

        /**
         * The timestamp the message was sent at
         * @type {number}
         */
        this.createdTimestamp = new Date(data.timestamp).getTime();

        /**
         * The timestamp the message was last edited at (if applicable)
         * @type {?number}
         */
        this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp).getTime() : null;

        /**
         * A collection of reactions to this message, mapped by the reaction ID
         * @type {Collection<Snowflake, MessageReaction>}
         */
        this.reactions = new Collection();
        if (data.reactions && data.reactions.length > 0) {
            for (const reaction of data.reactions) {
                const id = reaction.emoji.id ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name;
                this.reactions.set(id, new MessageReaction(this, reaction.emoji, reaction.count, reaction.me));
            }
        }

        /**
         * All valid mentions that the message contains
         * @type {MessageMentions}
         */
        this.mentions = new Mentions(this, data.mentions, data.mention_roles, data.mention_everyone);

        /**
         * ID of the webhook that sent the message, if applicable
         * @type {?Snowflake}
         */
        this.webhookID = data.webhook_id || null;

        /**
         * Whether this message is a hit in a search
         * @type {?boolean}
         */
        this.hit = typeof data.hit === 'boolean' ? data.hit : null;

        /**
         * The previous versions of the message, sorted with the most recent first
         * @type {Message[]}
         * @private
         */
        this._edits = [];
    }

    /**
     * Updates the message.
     * @param {Object} data Raw Discord message update data
     * @private
     */
    patch(data) {
        const clone = Util.cloneObject(this);
        this._edits.unshift(clone);

        this.editedTimestamp = new Date(data.edited_timestamp).getTime();
        if ('content' in data) this.content = data.content;
        if ('pinned' in data) this.pinned = data.pinned;
        if ('tts' in data) this.tts = data.tts;
        if ('embeds' in data) this.embeds = data.embeds.map(e => new Embed(this, e));
        else this.embeds = this.embeds.slice();

        if ('attachments' in data) {
            this.attachments = new Collection();
            for (const attachment of data.attachments) this.attachments.set(attachment.id, new Attachment(this, attachment));
        } else {
            this.attachments = new Collection(this.attachments);
        }

        this.mentions = new Mentions(
            this,
            'mentions' in data ? data.mentions : this.mentions.users,
            'mentions_roles' in data ? data.mentions_roles : this.mentions.roles,
            'mention_everyone' in data ? data.mention_everyone : this.mentions.everyone
        );
    }

    /**
     * The time the message was sent
     * @type {Date}
     * @readonly
     */
    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    /**
     * The time the message was last edited at (if applicable)
     * @type {?Date}
     * @readonly
     */
    get editedAt() {
        return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
    }

    /**
     * The guild the message was sent in (if in a guild channel)
     * @type {?Guild}
     * @readonly
     */
    get guild() {
        return this.channel.guild || null;
    }

    /**
     * The message contents with all mentions replaced by the equivalent text.
     * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
     * @type {string}
     * @readonly
     */
    get cleanContent() {
        return this.content
            .replace(/@(everyone|here)/g, '@\u200b$1')
            .replace(/<@!?[0-9]+>/g, input => {
                const id = input.replace(/<|!|>|@/g, '');
                if (this.channel.type === 'dm' || this.channel.type === 'group') {
                    return this.client.users.has(id) ? `@${this.client.users.get(id).username}` : input;
                }

                const member = this.channel.guild.members.get(id);
                if (member) {
                    if (member.nickname) return `@${member.nickname}`;
                    return `@${member.user.username}`;
                } else {
                    const user = this.client.users.get(id);
                    if (user) return `@${user.username}`;
                    return input;
                }
            })
            .replace(/<#[0-9]+>/g, input => {
                const channel = this.client.channels.get(input.replace(/<|#|>/g, ''));
                if (channel) return `#${channel.name}`;
                return input;
            })
            .replace(/<@&[0-9]+>/g, input => {
                if (this.channel.type === 'dm' || this.channel.type === 'group') return input;
                const role = this.guild.roles.get(input.replace(/<|@|>|&/g, ''));
                if (role) return `@${role.name}`;
                return input;
            });
    }

    /**
     * Creates a reaction collector.
     * @param {CollectorFilter} filter The filter to apply
     * @param {ReactionCollectorOptions} [options={}] Options to send to the collector
     * @returns {ReactionCollector}
     * @example
     * // Create a reaction collector
     * const collector = message.createReactionCollector(
     *   (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someID',
     *   { time: 15000 }
     * );
     * collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
     * collector.on('end', collected => console.log(`Collected ${collected.size} items`));
     */
    createReactionCollector(filter, options = {}) {
        return new ReactionCollector(this, filter, options);
    }

    /**
     * An object containing the same properties as CollectorOptions, but a few more:
     * @typedef {ReactionCollectorOptions} AwaitReactionsOptions
     * @property {string[]} [errors] Stop/end reasons that cause the promise to reject
     */

    /**
     * Similar to createMessageCollector but in promise form.
     * Resolves with a collection of reactions that pass the specified filter.
     * @param {CollectorFilter} filter The filter function to use
     * @param {AwaitReactionsOptions} [options={}] Optional options to pass to the internal collector
     * @returns {Promise<Collection<string, MessageReaction>>}
     */
    awaitReactions(filter, options = {}) {
        return new Promise((resolve, reject) => {
            const collector = this.createReactionCollector(filter, options);
            collector.once('end', (reactions, reason) => {
                if (options.errors && options.errors.includes(reason)) reject(reactions);
                else resolve(reactions);
            });
        });
    }

    /**
     * An array of cached versions of the message, including the current version
     * Sorted from latest (first) to oldest (last)
     * @type {Message[]}
     * @readonly
     */
    get edits() {
        const copy = this._edits.slice();
        copy.unshift(this);
        return copy;
    }

    /**
     * Whether the message is editable by the client user
     * @type {boolean}
     * @readonly
     */
    get editable() {
        return this.author.id === this.client.user.id;
    }

    /**
     * Whether the message is deletable by the client user
     * @type {boolean}
     * @readonly
     */
    get deletable() {
        return this.author.id === this.client.user.id || (this.guild &&
            this.channel.permissionsFor(this.client.user).has(Permissions.FLAGS.MANAGE_MESSAGES)
        );
    }

    /**
     * Whether the message is pinnable by the client user
     * @type {boolean}
     * @readonly
     */
    get pinnable() {
        return !this.guild ||
            this.channel.permissionsFor(this.client.user).has(Permissions.FLAGS.MANAGE_MESSAGES);
    }

    /**
     * Whether or not a user, channel or role is mentioned in this message.
     * @param {GuildChannel|User|Role|string} data Either a guild channel, user or a role object, or a string representing
     * the ID of any of these
     * @returns {boolean}
     */
    isMentioned(data) {
        data = data && data.id ? data.id : data;
        return this.mentions.users.has(data) || this.mentions.channels.has(data) || this.mentions.roles.has(data);
    }

    /**
     * Whether or not a guild member is mentioned in this message. Takes into account
     * user mentions, role mentions, and @everyone/@here mentions.
     * @param {GuildMember|User} member The member/user to check for a mention of
     * @returns {boolean}
     */
    isMemberMentioned(member) {
        // Lazy-loading is used here to get around a circular dependency that breaks things
        if (!GuildMember) GuildMember = require('./GuildMember');
        if (this.mentions.everyone) return true;
        if (this.mentions.users.has(member.id)) return true;
        if (member instanceof GuildMember && member.roles.some(r => this.mentions.roles.has(r.id))) return true;
        return false;
    }

    /**
     * Options that can be passed into editMessage.
     * @typedef {Object} MessageEditOptions
     * @property {Object} [embed] An embed to be added/edited
     * @property {string|boolean} [code] Language for optional codeblock formatting to apply
     */

    /**
     * Edit the content of the message.
     * @param {StringResolvable} [content] The new content for the message
     * @param {MessageEditOptions|RichEmbed} [options] The options to provide
     * @returns {Promise<Message>}
     * @example
     * // Update the content of a message
     * message.edit('This is my new content!')
     *   .then(msg => console.log(`Updated the content of a message from ${msg.author}`))
     *   .catch(console.error);
     */
    edit(content, options) {
        if (!options && typeof content === 'object' && !(content instanceof Array)) {
            options = content;
            content = '';
        } else if (!options) {
            options = {};
        }
        if (options instanceof RichEmbed) options = { embed: options };
        return this.client.rest.methods.updateMessage(this, content, options);
    }

    /**
     * Edit the content of the message, with a code block.
     * @param {string} lang The language for the code block
     * @param {StringResolvable} content The new content for the message
     * @returns {Promise<Message>}
     * @deprecated
     */
    editCode(lang, content) {
        content = Util.escapeMarkdown(this.client.resolver.resolveString(content), true);
        return this.edit(`\`\`\`${lang || ''}\n${content}\n\`\`\``);
    }

    /**
     * Wait for a reply to the message and returns the reply, returns false if the collector timed out without a reply
     * @param {Object} [options] An object of options
     * @param {Object || string} [options.message] A message to send along, usually if you want to await a reply to a question
     * @param {number} [options.timeout=60000] Time in milliseconds before the collector should stop, default is 60000 
     * @param {Channel} [options.channel=this] The channel in which a reply should be awaited, default is the channel in which the message has been sent 
     * @returns {Promise<Message>}
     */
    awaitReply(options) {
        return new Promise(async(resolve, reject) => {
            if (!options) options = Object.create(null);
            let channel = options.channel || this.channel;
            let query;
            if (options.message) query = await channel.send(options.message).catch(err => { return reject(err) });
            let reply;
            try {
                const collected = await channel.awaitMessages(m => m.author.id === this.author.id, {
                    max: 1,
                    time: options.timeout || 60000,
                    errors: ['time']
                });
                reply = collected.first();
            } catch (err) {
                reply = undefined;
            } finally {
                resolve({
                    reply: reply,
                    query: query
                });
            }
        });
    }

    /**
     * Get the users resolvable of a message.
     * @param {Object} [options] The options to provide
     * @param {number} [options.charLimit=3] The needed length for a word to be included in the resolve attempt, default is 3
     * @param {boolean} [options.guildOnly=true] Whether or not the resolve attempt should be limited to the guild members, default is true
     * @returns {Promise<Collection<id, User>>}
     * @example
     * // Get the users of a message
     * message.getUserResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} users`))
     *   .catch(console.error);
     */
    getUserResolvable(options) {
        return new Promise(async(resolve, reject) => {
            if (!options) options = { guildOnly: true };
            let potentialUserResolvables = this.content.split(/\s+/gim).filter(c => c.length >= (options.charLimit || 3));
            const usersResolved = new Collection();
            let range = options.guildOnly ? this.guild.members : this.client.users;
            if (range.size >= 250 && this.guild) this.guild.members = await this.guild.fetchMembers();
            for (let i = 0; i < potentialUserResolvables.length; i++) {
                //------------------Resolve by ID--------------------
                if (!isNaN(potentialUserResolvables[i]) && range.get(potentialUserResolvables[i])) usersResolved.set(potentialUserResolvables[i], range.first().guild ? range.get(potentialUserResolvables[i]).user : range.get(potentialUserResolvables[i]));
                //------------------Resolve by whole name--------------
                let filterByWholeName = range.filter(u => u.username === potentialUserResolvables[i]);
                if (filterByWholeName.size === 1) usersResolved.set(filterByWholeName.first().id, filterByWholeName.first().guild ? filterByWholeName.first().user : filterByWholeName.first());
                else if (filterByWholeName.size > 1) {
                    let i = 1;
                    filterByWholeName = Array.from(filterByWholeName.values());
                    let selectedUser = await this.awaitReply({
                        message: {
                            embed: {
                                title: ':mag: User search',
                                description: "Multiple users found, select one by typing a number ```\n" + filterByWholeName.map(u => `[${i++}] ${u.tag}`).join("\n")
                            }
                        }
                    });
                    selectedUser.query.delete();
                    if (selectedUser.reply && !isNaN(selectedUser.reply.content) && selectedUser.reply.content >= 1 && Math.round(Number(selectedUser.reply.content)) <= filterByWholeName.length) usersResolved.set(filterByWholeName[Math.round(Number(selectedUser.reply.content)) - 1].id, range.first().guild ? filterByWholeName[Math.round(Number(selectedUser.reply.content)) - 1].user : filterByWholeName[Math.round(Number(selectedUser.reply.content)) - 1]);
                    if (selectedUser.reply && selectedUser.reply.deletable) selectedUser.reply.delete();
                } else { //-----------------Resolve by case-insensitive name or nickname-----------------------------------
                    let filterUsers = range.filter(u => u.username.toLowerCase() === potentialUserResolvables[i].toLowerCase() || (u.nickname && u.nickname.toLowerCase() === potentialUserResolvables[i].toLowerCase()));
                    if (filterUsers.size > 1) {
                        let i = 1;
                        filterUsers = Array.from(filterUsers.values());
                        let selectedUser = await this.awaitReply({
                            message: {
                                embed: {
                                    title: ":mag: User search",
                                    description: "Multiple users found, select one by typing a number ```\n" + filterUsers.map(u => `[${i++}] ${u.tag}`).join("\n") + "```"
                                }
                            }
                        });
                        selectedUser.query.delete();
                        if (selectedUser.reply && !isNaN(selectedUser.reply.content) && selectedUser.reply.content >= 1 && Math.round(Number(selectedUser.reply.content)) <= filterUsers.length) usersResolved.set(filterUsers[Math.round(Number(selectedUser.reply.content)) - 1].id, range.first().guild ? filterUsers[Math.round(Number(selectedUser.reply.content)) - 1].user : filterUsers[Math.round(Number(selectedUser.reply.content)) - 1]);
                        if (selectedUser.reply && selectedUser.reply.deletable) selectedUser.reply.delete();
                    } else if (filterUsers.size === 1) usersResolved.set(filterUsers.first().id, filterUsers.first().guild ? filterUsers.first().user : filterUsers.first());
                    else {
                        //----------------Resolve by partial case-insensitive name or nickname-------------------------
                        //Note: Here we don't match if the "partial" thing is less than 30% (or 60% if not limited to guild) of the full username, because matching 3 letters out of a 32 letters username is kinda wew
                        let filterByPartial = range.filter(u => (u.username.toLowerCase().includes(potentialUserResolvables[i].toLowerCase()) && (Math.floor((potentialUserResolvables[i].length / u.username.length) * 100) >= (options.guildOnly ? 30 : 60))) || (u.nickname && u.nickname.toLowerCase().includes(potentialUserResolvables[i].toLowerCase()) && (Math.floor((potentialUserResolvables[i].length / u.nickname.length) * 100)) >= 30)).filter(m => !usersResolved.has(m.id));
                        if (filterByPartial.size === 1) usersResolved.set(filterByPartial.first().id, filterByPartial.first().guild ? filterByPartial.first().user : filterByPartial.first());
                        else if (filterByPartial.size > 1) {
                            filterByPartial = Array.from(filterByPartial.values());
                            let i = 1;
                            const selectedUser = await this.awaitReply({
                                message: {
                                    embed: {
                                        title: ":mag: User search",
                                        description: "Multiple users found, select one by typing a number ```\n" + filterByPartial.map(u => `[${i++}] ${u.tag}`).join("\n") + "```"
                                    }
                                }
                            });
                            selectedUser.query.delete();
                            if (selectedUser.reply && !isNaN(selectedUser.reply.content) && selectedUser.reply.content >= 1 && Math.round(Number(selectedUser.reply.content)) <= filterByPartial.length) usersResolved.set(filterByPartial[Math.round(Number(selectedUser.reply.content)) - 1].id, range.first().guild ? filterByPartial[Math.round(Number(selectedUser.reply.content)) - 1].user : filterByPartial[Math.round(Number(selectedUser.reply.content)) - 1]);
                            if (selectedUser.reply && selectedUser.reply.deletable) selectedUser.reply.delete();
                        }
                    }
                }
            }
            //--------------Finally, resolve by mentions--------------------
            if (this.mentions.users.first()) this.mentions.users.forEach(m => usersResolved.set(m.id, m));
            resolve(usersResolved);
        });
    }

    /**
     * Get the channels resolvable of a message.
     * @param {Object} [options] The options to provide
     * @param {number} [options.charLimit=3] The needed length for a word to be included in the resolve attempt, default is 3
     * @returns {Promise<Collection<id, Channel>>}
     * @example
     * // Get the channels of a message
     * message.getChannelResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} channels`))
     *   .catch(console.error);
     */
    getChannelResolvable(options) {
        return new Promise(async(resolve, reject) => {
            if (!options) options = Object.create(null);
            let potentialChannelsResolvables = this.content.split(/\s+/gim).filter(c => c.length >= (options.charLimit || 3));
            const channelsResolved = new Collection();
            let channels = this.guild.channels.filter(c => c.type === 'text');
            for (let i = 0; i < potentialChannelsResolvables.length; i++) {
                //------------------Resolve by ID--------------------
                if (!isNaN(potentialChannelsResolvables[i]) && channels.get(potentialChannelsResolvables[i])) channelsResolved.set(channels.get(potentialChannelsResolvables[i]).id, channels.get(potentialChannelsResolvables[i]));
                //------------------Resolve by whole name--------------
                let filterByWholeName = channels.filter(c => c.name === potentialChannelsResolvables[i].replace(/\#/gim, ''));
                if (filterByWholeName.size === 1) channelsResolved.set(filterByWholeName.first().id, filterByWholeName.first());
                else if (filterByWholeName.size > 1) {
                    let i = 1;
                    filterByWholeName = Array.from(filterByWholeName.values());
                    let selectedChannel = await this.awaitReply({
                        message: {
                            embed: {
                                title: ':mag: Channel search',
                                description: "Multiple channels found, select one by typing a number ```\n" + filterByWholeName.map(c => `[${i++}] #${c.name}`).join("\n")
                            }
                        }
                    });
                    selectedChannel.query.delete();
                    if (selectedChannel.reply && !isNaN(selectedChannel.reply.content) && selectedChannel.reply.content >= 1 && Math.round(Number(selectedChannel.reply.content)) <= filterByWholeName.length) channelsResolved.set(filterByWholeName[Math.round(Number(selectedChannel.reply.content)) - 1].id, filterByWholeName[Math.round(Number(selectedChannel.reply.content)) - 1]);
                    if (selectedChannel.reply && selectedChannel.reply.deletable) selectedChannel.reply.delete();
                } else { //-----------------Resolve by case-insensitive name-----------------------------------
                    let filterChannels = channels.filter(c => c.name.toLowerCase() === potentialChannelsResolvables[i].toLowerCase().replace(/\#/gim, ''));
                    if (filterChannels.size > 1) {
                        let i = 1;
                        filterChannels = Array.from(filterChannels.values());
                        let selectedChannel = await this.awaitReply({
                            message: {
                                embed: {
                                    title: ":mag: Channel search",
                                    description: "Multiple channels found, select one by typing a number ```\n" + filterUsers.map(c => `[${i++}] #${c.name}`).join("\n") + "```"
                                }
                            }
                        });
                        selectedChannel.query.delete();
                        if (selectedChannel.reply && !isNaN(selectedChannel.reply.content) && selectedChannel.reply.content >= 1 && Math.round(Number(selectedChannel.reply.content)) <= filterChannels.length) channelsResolved.set(filterChannels[Math.round(Number(selectedChannel.reply.content)) - 1].id, filterChannels[Math.round(Number(selectedChannel.reply.content)) - 1]);
                        if (selectedChannel.reply && selectedChannel.reply.deletable) selectedChannel.reply.delete();
                    } else if (filterChannels.size === 1) channelsResolved.set(filterChannels.first().id, filterChannels.first());
                    else {
                        //----------------Resolve by partial case-insensitive name-------------------------
                        //Note: Here we don't match if the "partial" thing is less than 30% of the full name, because matching 3 letters out of a 32 letters name is kinda wew
                        let filterByPartial = channels.filter(c => (c.name.toLowerCase().includes(potentialChannelsResolvables[i].toLowerCase()) && (Math.floor((potentialChannelsResolvables[i].length / c.name.length) * 100) >= 30))).filter(c => !channelsResolved.has(c.id));
                        if (filterByPartial.size === 1) channelsResolved.set(filterByPartial.first().id, filterByPartial.first());
                        else if (filterByPartial.size > 1) {
                            filterByPartial = Array.from(filterByPartial.values());
                            let i = 1;
                            const selectedChannel = await this.awaitReply({
                                message: {
                                    embed: {
                                        title: ":mag: Channel search",
                                        description: "Multiple channels found, select one by typing a number ```\n" + filterByPartial.map(c => `[${i++}] #${c.name}`).join("\n") + "```"
                                    }
                                }
                            });
                            selectedChannel.query.delete();
                            if (selectedChannel.reply && !isNaN(selectedChannel.reply.content) && selectedChannel.reply.content >= 1 && Math.round(Number(selectedChannel.reply.content)) <= filterByPartial.length) channelsResolved.set(filterByPartial[Math.round(Number(selectedChannel.reply.content)) - 1].id, filterByPartial[Math.round(Number(selectedChannel.reply.content)) - 1]);
                            if (selectedChannel.reply && selectedChannel.reply.deletable) selectedChannel.reply.delete();
                        }
                    }
                }
            }
            //--------------Finally, resolve by mentions--------------------
            if (this.mentions.channels.first()) this.mentions.channels.forEach(c => channelsResolved.set(c.id, c));
            resolve(channelsResolved);
        });
    }

    /**
     * Get the Roles resolvable of a message.
     * @param {Object} [options] The options to provide
     * @param {number} [options.charLimit=3] The needed length for a word to be included in the resolve attempt, default is 3
     * @returns {Promise<Collection<id, Role>>}
     * @example
     * // Get the Roles of a message
     * message.getRoleResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} Roles`))
     *   .catch(console.error);
     */
    getRoleResolvable(options) {
        return new Promise(async(resolve, reject) => {
            if (!options) options = Object.create(null);
            let potentialRolesResolvables = this.content.split(/\s+/gim).filter(r => r.length >= (options.charLimit || 3));
            const RolesResolved = new Collection();
            let roles = this.guild.roles;
            for (let i = 0; i < potentialRolesResolvables.length; i++) {
                //------------------Resolve by ID--------------------
                if (!isNaN(potentialRolesResolvables[i]) && roles.get(potentialRolesResolvables[i])) RolesResolved.set(roles.get(potentialRolesResolvables[i]).id, roles.get(potentialRolesResolvables[i]));
                //------------------Resolve by whole name--------------
                let filterByWholeName = roles.filter(r => r.name === potentialRolesResolvables[i]);
                if (filterByWholeName.size === 1) RolesResolved.set(filterByWholeName.first().id, filterByWholeName.first());
                else if (filterByWholeName.size > 1) {
                    let i = 1;
                    filterByWholeName = Array.from(filterByWholeName.values());
                    let selectedRole = await this.awaitReply({
                        message: {
                            embed: {
                                title: ':mag: Role search',
                                description: "Multiple Roles found, select one by typing a number ```\n" + filterByWholeName.map(c => `[${i++}] ${r.name}`).join("\n")
                            }
                        }
                    });
                    selectedRole.query.delete();
                    if (selectedRole.reply && !isNaN(selectedRole.reply.content) && selectedRole.reply.content >= 1 && Math.round(Number(selectedRole.reply.content)) <= filterByWholeName.length) RolesResolved.set(filterByWholeName[Math.round(Number(selectedRole.reply.content)) - 1].id, filterByWholeName[Math.round(Number(selectedRole.reply.content)) - 1]);
                    if (selectedRole.reply && selectedRole.reply.deletable) selectedRole.reply.delete();
                } else { //-----------------Resolve by case-insensitive name-----------------------------------
                    let filterRoles = roles.filter(r => r.name.toLowerCase() === potentialRolesResolvables[i].toLowerCase());
                    if (filterRoles.size > 1) {
                        let i = 1;
                        filterRoles = Array.from(filterRoles.values());
                        let selectedRole = await this.awaitReply({
                            message: {
                                embed: {
                                    title: ":mag: Role search",
                                    description: "Multiple Roles found, select one by typing a number ```\n" + filterRoles.map(r => `[${i++}] ${r.name}`).join("\n") + "```"
                                }
                            }
                        });
                        selectedRole.query.delete();
                        if (selectedRole.reply && !isNaN(selectedRole.reply.content) && selectedRole.reply.content >= 1 && Math.round(Number(selectedRole.reply.content)) <= filterRoles.length) RolesResolved.set(filterRoles[Math.round(Number(selectedRole.reply.content)) - 1].id, filterRoles[Math.round(Number(selectedRole.reply.content)) - 1]);
                        if (selectedRole.reply && selectedRole.reply.deletable) selectedRole.reply.delete();
                    } else if (filterRoles.size === 1) RolesResolved.set(filterRoles.first().id, filterRoles.first());
                    else {
                        //----------------Resolve by partial case-insensitive name-------------------------
                        //Note: Here we don't match if the "partial" thing is less than 30% of the full name, because matching 3 letters out of a 32 letters name is kinda wew
                        let filterByPartial = roles.filter(r => (r.name.toLowerCase().includes(potentialRolesResolvables[i].toLowerCase()) && (Math.floor((potentialRolesResolvables[i].length / r.name.length) * 100) >= 30))).filter(r => !RolesResolved.has(r.id));
                        if (filterByPartial.size === 1) RolesResolved.set(filterByPartial.first().id, filterByPartial.first());
                        else if (filterByPartial.size > 1) {
                            filterByPartial = Array.from(filterByPartial.values());
                            let i = 1;
                            const selectedRole = await this.awaitReply({
                                message: {
                                    embed: {
                                        title: ":mag: Role search",
                                        description: "Multiple Roles found, select one by typing a number ```\n" + filterByPartial.map(r => `[${i++}] ${r.name}`).join("\n") + "```"
                                    }
                                }
                            });
                            selectedRole.query.delete();
                            if (selectedRole.reply && !isNaN(selectedRole.reply.content) && selectedRole.reply.content >= 1 && Math.round(Number(selectedRole.reply.content)) <= filterByPartial.length) RolesResolved.set(filterByPartial[Math.round(Number(selectedRole.reply.content)) - 1].id, filterByPartial[Math.round(Number(selectedRole.reply.content)) - 1]);
                            if (selectedRole.reply && selectedRole.reply.deletable) selectedRole.reply.delete();
                        }
                    }
                }
            }
            //--------------Finally, resolve by mentions--------------------
            if (this.mentions.roles.first()) this.mentions.roles.forEach(r => RolesResolved.set(r.id, r));
            resolve(RolesResolved);
        });
    }

    /**
     * Get the guilds resolvable of a message.
     * @param {Object} [options] The options to provide
     * @param {number} [options.charLimit=3] The needed length for a word to be included in the resolve attempt, default is 3
     * @returns {Promise<Collection<id, Guild>>}
     * @example
     * // Get the guilds of a message
     * message.getGuildResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} guilds`))
     *   .catch(console.error);
     */
    getGuildResolvable(options) {
        return new Promise(async(resolve, reject) => {
            if (!options) options = Object.create(null);
            let potentialGuildsResolvables = this.content.split(/\s+/gim).filter(g => g.length >= (options.charLimit || 3));
            const guildsResolved = new Collection();
            let guilds = this.client.guilds;
            for (let i = 0; i < potentialGuildsResolvables.length; i++) {
                //------------------Resolve by ID--------------------
                if (!isNaN(potentialGuildsResolvables[i]) && guilds.get(potentialGuildsResolvables[i])) guildsResolved.set(guilds.get(potentialGuildsResolvables[i]).id, guilds.get(potentialGuildsResolvables[i]));
                //------------------Resolve by whole name--------------
                let filterByWholeName = guilds.filter(g => g.name === potentialGuildsResolvables[i]);
                if (filterByWholeName.size === 1) guildsResolved.set(filterByWholeName.first().id, filterByWholeName.first());
                else if (filterByWholeName.size > 1) {
                    let i = 1;
                    filterByWholeName = Array.from(filterByWholeName.values());
                    let selectedGuild = await this.awaitReply({
                        message: {
                            embed: {
                                title: ':mag: Guild search',
                                description: "Multiple guilds found, select one by typing a number ```\n" + filterByWholeName.map(g => `[${i++}] ${g.name}`).join("\n")
                            }
                        }
                    });
                    selectedGuild.query.delete();
                    if (selectedGuild.reply && !isNaN(selectedGuild.reply.content) && selectedGuild.reply.content >= 1 && Math.round(Number(selectedGuild.reply.content)) <= filterByWholeName.length) guildsResolved.set(filterByWholeName[Math.round(Number(selectedGuild.reply.content)) - 1].id, filterByWholeName[Math.round(Number(selectedGuild.reply.content)) - 1]);
                    if (selectedGuild.reply && selectedGuild.reply.deletable) selectedGuild.reply.delete();
                } else { //-----------------Resolve by case-insensitive name-----------------------------------
                    let filterGuilds = guilds.filter(g => g.name.toLowerCase() === potentialGuildsResolvables[i].toLowerCase());
                    if (filterGuilds.size > 1) {
                        let i = 1;
                        filterGuilds = Array.from(filterGuilds.values());
                        let selectedGuild = await this.awaitReply({
                            message: {
                                embed: {
                                    title: ":mag: Guild search",
                                    description: "Multiple guilds found, select one by typing a number ```\n" + filterUsers.map(g => `[${i++}] ${g.name}`).join("\n") + "```"
                                }
                            }
                        });
                        selectedGuild.query.delete();
                        if (selectedGuild.reply && !isNaN(selectedGuild.reply.content) && selectedGuild.reply.content >= 1 && Math.round(Number(selectedGuild.reply.content)) <= filterguilds.length) guildsResolved.set(filterguilds[Math.round(Number(selectedGuild.reply.content)) - 1].id, filterguilds[Math.round(Number(selectedGuild.reply.content)) - 1]);
                        if (selectedGuild.reply && selectedGuild.reply.deletable) selectedGuild.reply.delete();
                    } else if (filterGuilds.size === 1) guildsResolved.set(filterGuilds.first().id, filterGuilds.first());
                    else {
                        //----------------Resolve by partial case-insensitive name-------------------------
                        //Note: Here we don't match if the "partial" thing is less than 55% of the full name, because matching 3 letters out of a 32 letters name is kinda wew
                        let filterByPartial = guilds.filter(g => (g.name.toLowerCase().includes(potentialGuildsResolvables[i].toLowerCase()) && (Math.floor((potentialGuildsResolvables[i].length / g.name.length) * 100) >= 55))).filter(g => !guildsResolved.has(g.id));
                        if (filterByPartial.size === 1) guildsResolved.set(filterByPartial.first().id, filterByPartial.first());
                        else if (filterByPartial.size > 1) {
                            filterByPartial = Array.from(filterByPartial.values());
                            let i = 1;
                            const selectedGuild = await this.awaitReply({
                                message: {
                                    embed: {
                                        title: ":mag: Guild search",
                                        description: "Multiple guilds found, select one by typing a number ```\n" + filterByPartial.map(g => `[${i++}] ${g.name}`).join("\n") + "```"
                                    }
                                }
                            });
                            selectedGuild.query.delete();
                            if (selectedGuild.reply && !isNaN(selectedGuild.reply.content) && selectedGuild.reply.content >= 1 && Math.round(Number(selectedGuild.reply.content)) <= filterByPartial.length) guildsResolved.set(filterByPartial[Math.round(Number(selectedGuild.reply.content)) - 1].id, filterByPartial[Math.round(Number(selectedGuild.reply.content)) - 1]);
                            if (selectedGuild.reply && selectedGuild.reply.deletable) selectedGuild.reply.delete();
                        }
                    }
                }
            }
            resolve(guildsResolved);
        });
    }


    /**
     * Pins this message to the channel's pinned messages.
     * @returns {Promise<Message>}
     */
    pin() {
        return this.client.rest.methods.pinMessage(this);
    }

    /**
     * Unpins this message from the channel's pinned messages.
     * @returns {Promise<Message>}
     */
    unpin() {
        return this.client.rest.methods.unpinMessage(this);
    }

    /**
     * Add a reaction to the message.
     * @param {string|Emoji|ReactionEmoji} emoji The emoji to react with
     * @returns {Promise<MessageReaction>}
     */
    react(emoji) {
        emoji = this.client.resolver.resolveEmojiIdentifier(emoji);
        if (!emoji) throw new TypeError('Emoji must be a string or Emoji/ReactionEmoji');

        return this.client.rest.methods.addMessageReaction(this, emoji);
    }

    /**
     * Remove all reactions from a message.
     * @returns {Promise<Message>}
     */
    clearReactions() {
        return this.client.rest.methods.removeMessageReactions(this);
    }

    /**
     * Deletes the message.
     * @param {number} [timeout=0] How long to wait to delete the message in milliseconds
     * @returns {Promise<Message>}
     * @example
     * // Delete a message
     * message.delete()
     *   .then(msg => console.log(`Deleted message from ${msg.author}`))
     *   .catch(console.error);
     */
    delete(timeout = 0) {
        if (timeout <= 0) {
            return this.client.rest.methods.deleteMessage(this).catch(err => { console.error(err); return false });
        } else {
            return new Promise(resolve => {
                this.client.setTimeout(() => {
                    resolve(this.delete());
                }, timeout);
            });
        }
    }

    /**
     * Reply to the message.
     * @param {StringResolvable} [content] The content for the message
     * @param {MessageOptions} [options] The options to provide
     * @returns {Promise<Message|Message[]>}
     * @example
     * // Reply to a message
     * message.reply('Hey, I\'m a reply!')
     *   .then(msg => console.log(`Sent a reply to ${msg.author}`))
     *   .catch(console.error);
     */
    reply(content, options) {
        if (!options && typeof content === 'object' && !(content instanceof Array)) {
            options = content;
            content = '';
        } else if (!options) {
            options = {};
        }
        return this.channel.send(content, Object.assign(options, { reply: this.member || this.author }));
    }

    /**
     * Marks the message as read.
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<Message>}
     */
    acknowledge() {
        return this.client.rest.methods.ackMessage(this);
    }

    /**
     * Fetches the webhook used to create this message.
     * @returns {Promise<?Webhook>}
     */
    fetchWebhook() {
        if (!this.webhookID) return Promise.reject(new Error('The message was not sent by a webhook.'));
        return this.client.fetchWebhook(this.webhookID);
    }

    /**
     * Used mainly internally. Whether two messages are identical in properties. If you want to compare messages
     * without checking all the properties, use `message.id === message2.id`, which is much more efficient. This
     * method allows you to see if there are differences in content, embeds, attachments, nonce and tts properties.
     * @param {Message} message The message to compare it to
     * @param {Object} rawData Raw data passed through the WebSocket about this message
     * @returns {boolean}
     */
    equals(message, rawData) {
        if (!message) return false;
        const embedUpdate = !message.author && !message.attachments;
        if (embedUpdate) return this.id === message.id && this.embeds.length === message.embeds.length;

        let equal = this.id === message.id &&
            this.author.id === message.author.id &&
            this.content === message.content &&
            this.tts === message.tts &&
            this.nonce === message.nonce &&
            this.embeds.length === message.embeds.length &&
            this.attachments.length === message.attachments.length;

        if (equal && rawData) {
            equal = this.mentions.everyone === message.mentions.everyone &&
                this.createdTimestamp === new Date(rawData.timestamp).getTime() &&
                this.editedTimestamp === new Date(rawData.edited_timestamp).getTime();
        }

        return equal;
    }

    /**
     * When concatenated with a string, this automatically concatenates the message's content instead of the object.
     * @returns {string}
     * @example
     * // Logs: Message: This is a message!
     * console.log(`Message: ${message}`);
     */
    toString() {
        return this.content;
    }

    _addReaction(emoji, user) {
        const emojiID = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
        let reaction;
        if (this.reactions.has(emojiID)) {
            reaction = this.reactions.get(emojiID);
            if (!reaction.me) reaction.me = user.id === this.client.user.id;
        } else {
            reaction = new MessageReaction(this, emoji, 0, user.id === this.client.user.id);
            this.reactions.set(emojiID, reaction);
        }
        if (!reaction.users.has(user.id)) {
            reaction.users.set(user.id, user);
            reaction.count++;
        }
        return reaction;
    }

    _removeReaction(emoji, user) {
        const emojiID = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
        if (this.reactions.has(emojiID)) {
            const reaction = this.reactions.get(emojiID);
            if (reaction.users.has(user.id)) {
                reaction.users.delete(user.id);
                reaction.count--;
                if (user.id === this.client.user.id) reaction.me = false;
                if (reaction.count <= 0) this.reactions.delete(emojiID);
                return reaction;
            }
        }
        return null;
    }

    _clearReactions() {
        this.reactions.clear();
    }
}

module.exports = Message;