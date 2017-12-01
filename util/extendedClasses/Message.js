"use strict";

const Base = require("./Base");
const Call = require("./Call");
const SystemJoinMessages = require("../Constants").SystemJoinMessages;
const Mentions = require(`./MessageMentions`);
const Collection = require(`../util/Collection`);
const MessageReaction = require('./MessageReaction');
const ReactionCollector = require('./ReactionCollector');
const User = require("./User");

/**
 * Extended message, meant to replace Eris's one
 * @prop {String} id The ID of the message
 * @prop {Channel} channel The channel the message is in
 * @prop {Number} timestamp Timestamp of message creation
 * @prop {Number} type The type of the message
 * @prop {User} author The message author
 * @prop {Member?} member The message author with server-specific data
 * @prop {User[]} mentions Array of mentioned users
 * @prop {String} content Message content
 * @prop {String?} cleanContent Message content with mentions replaced by names, and @everyone/@here escaped
 * @prop {String[]} roleMentions Array of mentioned roles' ids
 * @prop {String[]?} channelMentions Array of mentions channels' ids
 * @prop {Number?} editedTimestamp Timestamp of latest message edit
 * @prop {Boolean} tts Whether to play the message using TTS or not
 * @prop {Boolean} mentionEveryone Whether the message mentions everyone/here or not
 * @prop {Object[]} attachments Array of attachments
 * @prop {Object[]} embeds Array of embeds
 * @prop {Object} reactions An object containing the reactions on the message
 * @prop {Number} reactions.count The number of times the reaction was used
 * @prop {Boolean} reactions.me Whether or not the bot user did the reaction
 * @prop {Boolean} pinned Whether the message is pinned or not
 * @prop {Command?} command The Command used in the Message, if any (CommandClient only)
 */
class Message extends Base {
    constructor(data, client) {
        super(data.id);
        this._client = client;
        this.type = data.type || 0;
        this.timestamp = Date.parse(data.timestamp);
        this.channel = client.getChannel(data.channel_id) || {
            id: data.channel_id
        };
        this.content = "";
        this.hit = !!data.hit;
        this.reactions = {};
        if (data.author) {
            if (data.author.discriminator !== "0000") {
                this.author = client.users.add(data.author, client);
            } else {
                this.author = new User(data.author, client);
            }
        } else if (data.timestamp) {
            this._client.emit("error", "MESSAGE_CREATE but no message author:\n" + JSON.stringify(data, null, 2));
        }
        if (this.type === 0 || this.type === undefined);
        else if (this.type === 1) {
            data.content = `${this.author.mention} added <@${data.mentions[0].id}>.`;
        } else if (this.type === 2) {
            if (this.author.id === data.mentions[0].id) {
                data.content = `@${this.author.username} left the group.`;
            } else {
                data.content = `${this.author.mention} removed @${data.mentions[0].username}.`;
            }
        } else if (this.type === 3) { // (╯°□°）╯︵ ┻━┻
            if (data.call.ended_timestamp) {
                if ((!this.channel.lastCall || this.channel.lastCall.endedTimestamp < Date.parse(data.call.ended_timestamp))) {
                    data.call.id = this.id;
                    this.channel.lastCall = new Call(data.call, this.channel);
                }
                if (~data.call.participants.indexOf(client.user.id)) {
                    data.content = `You missed a call from ${this.author.mention}.`;
                } else {
                    data.content = `${this.author.mention} started a call.`;
                }
            } else {
                if (!this.channel.call) {
                    data.call.id = this.id;
                    this.channel.call = new Call(data.call, this.channel);
                }
                data.content = `${this.author.mention} started a call. — Join the call.`;
            }
        } else if (this.type === 4) {
            data.content = `${this.author.mention} changed the channel name: ${data.content}`;
        } else if (this.type === 5) {
            data.content = `${this.author.mention} changed the channel icon.`;
        } else if (this.type === 6) {
            data.content = `${this.author.mention} pinned a message to this channel. See all the pins.`;
        } else if (this.type === 7) {
            data.content = SystemJoinMessages[~~(this.createdAt % SystemJoinMessages.length)].replace(/%user%/g, this.author.mention);
        } else {
            throw new Error("Unhandled MESSAGE_CREATE type: " + JSON.stringify(data, null, 2));
        }

        this.update(data, client);
    }

    update(data, client) {
        if (this.type === 3) { // (╯°□°）╯︵ ┻━┻
            (this.channel.call || this.channel.lastCall).update(data.call);
        }
        if (data.content !== undefined) {
            this.content = data.content || "";
            this.mentionEveryone = !!data.mention_everyone;

            /**
             * All valid mentions that the message contains
             * @type {MessageMentions}
             */
            this.mentions = new Mentions(this, data.mentions, data.mention_roles, data.mention_everyone);

            this.roleMentions = data.mention_roles;
        }

        this.pinned = data.pinned !== undefined ? !!data.pinned : this.pinned;
        this.editedTimestamp = data.edited_timestamp !== undefined ? Date.parse(data.edited_timestamp) : this.editedTimestamp;
        this.tts = data.tts !== undefined ? data.tts : this.tts;
        this.attachments = data.attachments !== undefined ? data.attachments : this.attachments;
        this.embeds = data.embeds !== undefined ? data.embeds : this.embeds;

        if (data.reactions) {
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
        }
    }

    get cleanContent() {
        var cleanContent = this.content;

        if (this.mentions) {
            this.mentions.forEach((mention) => {
                if (this.channel.guild) {
                    var member = this.channel.guild.members.get(mention.id);
                    if (member && member.nick) {
                        cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@" + member.nick);
                    }
                }
                cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@" + mention.username);
            });
        }

        if (this.channel.guild && this.roleMentions) {
            for (var roleID of this.roleMentions) {
                var role = this.channel.guild.roles.get(roleID);
                var roleName = role ? role.name : "deleted-role";
                cleanContent = cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), "@" + roleName);
            }
        }

        this.channelMentions.forEach((id) => {
            var channel = this._client.getChannel(id);
            if (channel && channel.name && channel.mention) {
                cleanContent = cleanContent.replace(channel.mention, "#" + channel.name);
            }
        });

        return cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
    }

    /**
     * The guild the message was sent in, if any
     */
    get guild() {
        return this.channel.guild;
    }

    get channelMentions() {
        if (this._channelMentions) {
            return this._channelMentions;
        }

        return (this._channelMentions = (this.content.match(/<#[0-9]+>/g) || []).map((mention) => mention.substring(2, mention.length - 1)));
    }

    get member() {
        return this.channel.guild && this.author && this.channel.guild.members.get(this.author.id) || null;
    }

    /**
     * Whether the message is deletable by the client user
     * @type {boolean}
     * @readonly
     */
    get deletable() {
        return this.author.id === this._client.user.id || (this.guild &&
            this.channel.permissionsOf(this._client.user.id).has("manageMessages")
        );
    }

    /**
     * Edit the message
     * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
     * @arg {String} content.content A content string
     * @arg {Boolean} [content.disableEveryone] Whether to filter @everyone/@here or not (overrides default)
     * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discordapp.com/developers/docs/resources/channel#embed-object) for object structure
     * @returns {Promise<Message>}
     */
    edit(content) {
        return this._client.editMessage.call(this._client, this.channel.id, this.id, content);
    }

    /**
     * Pin the message
     * @returns {Promise}
     */
    pin() {
        return this._client.pinMessage.call(this._client, this.channel.id, this.id);
    }

    /**
     * Unpin the message
     * @returns {Promise}
     */
    unpin() {
        return this._client.unpinMessage.call(this._client, this.channel.id, this.id);
    }

    /**
     * Get a list of users who reacted with a specific reaction
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {Number} [limit=100] The maximum number of users to get
     * @arg {String} [before] Get users before this user ID
     * @arg {String} [after] Get users after this user ID
     * @returns {Promise<User[]>}
     */
    getReaction(reaction, limit, before, after) {
        return this._client.getMessageReaction.call(this._client, this.channel.id, this.id, reaction, limit, before, after);
    }

    /**
     * Add a reaction to a message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {String} [userID="@me"] The ID of the user to react as
     * @returns {Promise}
     */
    addReaction(reaction, userID) {
        return this._client.addMessageReaction.call(this._client, this.channel.id, this.id, reaction, userID);
    }

    /**
     * Remove a reaction from a message
     * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
     * @arg {String} [userID="@me"] The ID of the user to remove the reaction for
     * @returns {Promise}
     */
    removeReaction(reaction, userID) {
        return this._client.removeMessageReaction.call(this._client, this.channel.id, this.id, reaction, userID);
    }

    /**
     * Wait for a reply to the message and returns the reply, returns false if the collector timed out without a reply
     * @param {Object} [options] An object of options
     * @param {Object || string} [options.message] A message to send along, usually if you want to await a reply to a question
     * @param {number} [options.timeout=60000] Time in milliseconds before the collector should stop, default is 60000 
     * @param {Channel} [options.channel=this] The channel in which a reply should be awaited, default is the channel in which the message has been sent 
     * @returns {Promise<Message>}
     */
    awaitReply(options = {}) {
        return new Promise(async(resolve, reject) => {
            let channel = options.channel || this.channel;
            let query;
            if (options.message) query = await channel.createMessage(options.message).catch(err => { return reject(err) });
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
     * @param {Number} [options.charLimit=3] The needed length for a word to be included in the resolve attempt, default is 3
     * @param {Boolean} [options.guildOnly=true] Whether or not the resolve attempt should be limited to the guild members, default is true
     * @param {Number} [options.max=infinity] Max users to resolve
     * @returns {Promise<Collection<id, User>>}
     * @example
     * // Get the users of a message
     * message.getUserResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} users`))
     *   .catch(console.error);
     */
    getUserResolvable(options = { guildOnly: true }) {
        return new Promise(async(resolve, reject) => {
            let potentialUserResolvables = this.content.split(/\s+/gim).filter(c => c.length >= (options.charLimit || 3));
            const usersResolved = new Collection();
            let range = options.guildOnly ? this.guild.members : this._client.users;
            for (let i = 0; i < potentialUserResolvables.length; i++) {
                if (options.max === usersResolved.size) return resolve(usersResolved);
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
                                description: "Multiple users found, select one by typing a number ```\n" + filterByWholeName.map(u => `[${i++}] ${u.tag}`).join("\n") + "```"
                            }
                        }
                    });
                    selectedUser.query.delete();
                    if (selectedUser.reply && !isNaN(selectedUser.reply.content) && selectedUser.reply.content >= 1 && Math.round(Number(selectedUser.reply.content)) <= filterByWholeName.length) usersResolved.set(filterByWholeName[Math.round(Number(selectedUser.reply.content)) - 1].id, range.first().guild ? filterByWholeName[Math.round(Number(selectedUser.reply.content)) - 1].user : filterByWholeName[Math.round(Number(selectedUser.reply.content)) - 1]);
                    if (selectedUser.reply && selectedUser.reply.deletable) selectedUser.reply.delete();
                } else { //-----------------Resolve by case-insensitive name or nickname-----------------------------------
                    let filterUsers = range.filter(u =>
                        u.username.toLowerCase() === potentialUserResolvables[i].toLowerCase() ||
                        (u.nickname && u.nickname.toLowerCase() === potentialUserResolvables[i].toLowerCase()));
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
                        //Note: Here we don't match if the "partial" thing is less than 50% (or 70% if not limited to guild) of the full username, because matching 3 letters out of a 32 letters username is kinda wew
                        let filterByPartial = range.filter(u =>
                                (u.username.toLowerCase().includes(potentialUserResolvables[i].toLowerCase()) &&
                                    (Math.floor((potentialUserResolvables[i].length / u.username.length) * 100) >= (options.guildOnly ? 50 : 70))) ||
                                (u.nickname && u.nickname.toLowerCase().includes(potentialUserResolvables[i].toLowerCase()) &&
                                    (Math.floor((potentialUserResolvables[i].length / u.nickname.length) * 100)) >= 50))
                            .filter(m => !usersResolved.has(m.id));
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
     * @param {Number} [options.max=infinity] Max channels to resolve
     * @returns {Promise<Collection<id, Channel>>}
     * @example
     * // Get the channels of a message
     * message.getChannelResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} channels`))
     *   .catch(console.error);
     */
    getChannelResolvable(options = {}) {
        return new Promise(async(resolve, reject) => {
            let potentialChannelsResolvables = this.content.split(/\s+/gim).filter(c => c.length >= (options.charLimit || 3));
            const channelsResolved = new Collection();
            let channels = this.guild.channels.filter(c => c.type === 0);
            for (let i = 0; i < potentialChannelsResolvables.length; i++) {
                if (options.max === channelsResolved.size) return resolve(channelsResolved);
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
     * @param {Number} [options.max=infinity] Max roles to resolve
     * @returns {Promise<Collection<id, Role>>}
     * @example
     * // Get the Roles of a message
     * message.getRoleResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} Roles`))
     *   .catch(console.error);
     */
    getRoleResolvable(options = {}) {
        return new Promise(async(resolve, reject) => {
            let potentialRolesResolvables = this.content.split(/\s+/gim).filter(r => r.length >= (options.charLimit || 3));
            const RolesResolved = new Collection();
            let roles = this.guild.roles;
            for (let i = 0; i < potentialRolesResolvables.length; i++) {
                if (options.max === RolesResolved.size) return resolve(RolesResolved);
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
     * @param {Number} [options.charLimit=3] The needed length for a word to be included in the resolve attempt, default is 3
     * @param {Number} [options.max=infinity] Max guilds to resolve
     * @returns {Promise<Collection<id, Guild>>}
     * @example
     * // Get the guilds of a message
     * message.getGuildResolvable()
     *   .then(collection => console.log(`Resolved ${collection.size} guilds`))
     *   .catch(console.error);
     */
    getGuildResolvable(options = {}) {
        return new Promise(async(resolve, reject) => {
            let potentialGuildsResolvables = this.content.split(/\s+/gim).filter(g => g.length >= (options.charLimit || 3));
            const guildsResolved = new Collection();
            let guilds = this._client.guilds;
            for (let i = 0; i < potentialGuildsResolvables.length; i++) {
                if (options.max >= guildsResolved.size) return resolve(guildsResolved);
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
     * Remove all reactions from a message
     * @returns {Promise}
     */
    removeReactions() {
        return this._client.removeMessageReactions.call(this._client, this.channel.id, this.id);
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
     * Delete the message
     * @arg {String} [reason] The reason to be displayed in audit logs
     * @returns {Promise}
     */
    delete(reason) {
        return this._client.deleteMessage.call(this._client, this.channel.id, this.id, reason);
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

    toJSON() {
        var base = super.toJSON(true);
        for (var prop of["attachments", "author", "content", "editTimestamp", "embeds", "hit", "mentionEveryone", "mentions", "pinned", "reactions", "roleMentions", "timestamp", "tts", "type"]) {
            base[prop] = this[prop] && this[prop].toJSON ? this[prop].toJSON() : this[prop];
        }
        return base;
    }
}

module.exports = Message;