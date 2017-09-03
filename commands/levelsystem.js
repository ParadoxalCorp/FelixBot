exports.run = async(client, message) => {
    try {
        const guildEntry = client.guildDatas.get(message.guild.id);
        var args = message.content.split(/\s+/gim);
        args.shift();
        var rolelist = false;
        if (args.length !== 0) {
            var rolelist = client.searchForParameter({
                message: args[0],
                parameter: "rolelist",
                newParameters: {
                    aliases: ['rolelist', 'rl'],
                    name: 'rolelist'
                }
            });
        }
        if (args.length === 0) {
            const settings = await client.awaitReply({
                message: message,
                title: `:gear: Level system settings`,
                question: 'What do you want to do? Type a number to select an option ```\n[1] - Reset levels\n[2] - Edit level up notifications\n[3] - Edit/see roles added on level up\n[4] - Edit server global xp privacy```'
            });
            if (!settings) {
                return await message.channel.send(":x: Command aborted");
            }
            if (settings.reply.content === "1") {
                await settings.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await settings.reply.delete();
                }
                if (!guildEntry.levelSystem || guildEntry.levelSystem.users.length === 0) {
                    return await message.channel.send(":x: There's nothing to reset");
                }
                const resetConfirmation = await client.awaitReply({
                    message: message,
                    title: `:gear: Reset confirmation`,
                    question: `Are you sure about that? Type \`yes\` to confirm the level reset or anything else to abort`
                });
                if (!resetConfirmation) {
                    return await message.channel.send(":x: Command aborted");
                } else if (!resetConfirmation.reply.content === "yes") {
                    return await message.channel.send(":x: Command aborted");
                }
                guildEntry.levelSystem.users.forEach(function (user) {
                    const userPos = guildEntry.levelSystem.users.findIndex(function (element) {
                        return element.id === user.id;
                    });
                    guildEntry.levelSystem.users[userPos].expCount = 0;
                    guildEntry.levelSystem.users[userPos].level = 0;
                });
                guildEntry.levelSystem.totalExp = 0;
                client.guildDatas.set(message.guild.id, guildEntry);
                await resetConfirmation.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await resetConfirmation.reply.delete();
                }
                return await message.channel.send(":white_check_mark: Alright, all users levels got nuked");
            } else if (settings.reply.content === "2") {
                await settings.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await settings.reply.delete();
                }
                var levelUp = await client.awaitReply({
                    message: message,
                    title: `:gear: Level system settings`,
                    question: 'Which way i should notify people when they level up?```\n[1] - Channel\n[2] - Private message\n[3] - Disable level up notifications```',
                });
                if (!levelUp) {
                    return await message.channel.send(":x: Command aborted");
                } else if (levelUp.reply.content !== "1" && levelUp.reply.content !== "2" && levelUp.reply.content !== "3") {
                    return await message.channel.send(":x: The number you specified is not valid");
                } else if (levelUp.reply.content === "1") {
                    levelUp = "channel";
                } else if (levelUp.reply.content === "2") {
                    levelUp = "dm";
                } else if (levelUp.reply.content === "3") {
                    levelUp = false;
                }
					if (!guildEntry.levelSystem) {
						return await message.channel.send(":x: You must enable the level system at least one time before doing that");
					}				
                guildEntry.levelSystem.levelUpNotif = levelUp;
                client.guildDatas.set(message.guild.id, guildEntry);
                await levelUp.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await levelUp.reply.delete();
                }
                return await message.channel.send(":white_check_mark: Alright, i updated the level up notifications method <:awoo_rainbow:345171973724176385>");
            } else if (settings.reply.content === "3") {
                await settings.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await settings.reply.delete();
                }
                const roleAction = await client.awaitReply({
                    message: message,
                    title: `:gear: Level system roles settings`,
                    question: 'What do you want to do```\n[1] - Add a role to the list\n[2] - Remove a role from/see the list```'
                });
                if (!roleAction) {
                    return await message.channel.send(":x: Command aborted");
                }
                if (isNaN(roleAction.reply.content)) {
                    await roleAction.question.delete();
                    if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await roleAction.reply.delete();
                    }
                    return await message.channel.send(":x: Command aborted");
                }
                if (roleAction.reply.content === "1") {
                    await roleAction.question.delete();
                    if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await roleAction.reply.delete();
                    }
                    const roleToGive = await client.awaitReply({
                        message: message,
                        title: `:gear: Level system settings`,
                        question: 'Which role should i give?',
                        limit: 60000
                    });
                    if (!roleToGive) {
                        return await message.channel.send(":x: Command aborted");
                    } else if (!message.guild.roles.find("name", roleToGive.reply.content)) {
                        await roleToGive.question.delete();
                        if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                            await roleToGive.reply.delete();
                        }
                        return await message.channel.send(":x: I could not find the role you specified");
                    }
                    const role = message.guild.roles.find("name", roleToGive.reply.content);
                    const checkRole = guildEntry.levelSystem.roles.findIndex(function (element) {
                        return element.id === role.id;
                    });
                    if (checkRole !== -1) {
                        const overwriteConfirmation = await client.awaitReply({
                            message: message,
                            title: `:gear: Overwrite confirmation`,
                            question: `I already give this role at the level **${guildEntry.levelSystem.roles[checkRole].atLevel}**. Do you want to continue anyway?\nAnswer with \`yes\` to continue, it will overwrite the database, or with anything else to abort`
                        });
                        if (!overwriteConfirmation) {
                            return await message.channel.send(":x: Command aborted");
                        } else if (overwriteConfirmation.reply.content !== "yes") {
                            await overwriteConfirmation.question.delete();
                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                                await overwriteConfirmation.reply.delete();
                            }
                            return await message.channel.send(":x: Command aborted");
                        }
                        guildEntry.levelSystem.roles.splice(checkRole, 1);
                    }
                    const atLevel = await client.awaitReply({
                        message: message,
                        title: `:gear: Level system settings`,
                        question: `And at which level should i give this role?`
                    });
                    if (!atLevel) {
                        return await message.channel.send(":x: Command aborted");
                    } else if (Number.isNaN(atLevel.reply.content)) {
                        return await message.channel.send(":x: You did not specified a valid number");
                    }
                    guildEntry.levelSystem.roles.push({
                        id: role.id,
                        atLevel: Math.round(Number(atLevel.reply.content))
                    });
                    client.guildDatas.set(message.guild.id, guildEntry);
                    await atLevel.question.delete();
                    if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await atLevel.reply.delete();
                    }
                    return await message.channel.send("Alright, i will give the role **" + role.name + "** to every member who reach the level **" + Math.round(atLevel.reply.content) + "**");
                } else if (roleAction.reply.content === "2") {
                    if (guildEntry.levelSystem.roles.length === 0) {
                        return await message.channel.send(":x: There is no roles that are set to be assigned on level up on this server");
                    }
                    guildEntry.levelSystem.roles.forEach(function (role) { //Automatically remove roles that doesnt exist anymore
                        if (!message.guild.roles.get(role.id)) {
                            guildEntry.levelSystem.roles.splice(guildEntry.levelSystem.roles.findIndex(function (element) {
                                return element.id === role.id;
                            }), 1);
                        }
                    });
                    var page = 0;
                    const interactiveMessage = await message.channel.send({
                        embed: {
                            title: ":gear: On level-up roles list",
                            description: "This is the list of the roles i add on specific levels, use :wastebasket: to remove one, :x: to quit this command and the arrows to move through pages",
                            fields: [{
                                name: ":notepad_spiral: Role",
                                value: `${message.guild.roles.get(guildEntry.levelSystem.roles[0].id).name}`,
                                inline: true
                    }, {
                                name: ":up: At level",
                                value: `${guildEntry.levelSystem.roles[0].atLevel}`,
                                inline: true
                    }],
                            footer: {
                                text: `Showing page ${page + 1}/${guildEntry.levelSystem.roles.length}`
                            }
                        }
                    });
                    await interactiveMessage.react("⏮");
                    await interactiveMessage.react("◀");
                    await interactiveMessage.react("▶");
                    await interactiveMessage.react("⏭");
                    await interactiveMessage.react("🗑");
                    await interactiveMessage.react("❌");
                    const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
                    var timeout = setTimeout(async function () {
                        collector.stop("Timeout");
                        return await interactiveMessage.delete();
                    }, 120000);
                    collector.on('collect', async(r) => {
                        clearTimeout(timeout); //Reset the countdown
                        async function updateMessage(page) {
                            await interactiveMessage.edit({
                                embed: {
                                    title: ":gear: On level-up roles list",
                                    description: "This is the list of the roles i add on specific levels, use :wastebasket: to remove one, :x: to quit this command and the arrows to move through pages",
                                    fields: [{
                                        name: ":notepad_spiral: Content",
                                        value: `${message.guild.roles.get(guildEntry.levelSystem.roles[page].id).name}`,
                                        inline: true
                    }, {
                                        name: ":up: At level",
                                        value: `${guildEntry.levelSystem.roles[page].atLevel}`,
                                        inline: true
                    }],
                                    footer: {
                                        text: `Showing page ${page + 1}/${guildEntry.levelSystem.roles.length}`
                                    }
                                }
                            });
                        }
                        if (r.emoji.name === "⏮") { //-----------------Move to the first page
                            if (page !== 0) {
                                page = 0;
                                updateMessage(page);
                            }
                        } else if (r.emoji.name === "◀") { //----------------------Move to the previous page
                            if (page === 0) {
                                page = guildEntry.levelSystem.roles.length - 1;
                            } else {
                                page = page - 1;
                            }
                            updateMessage(page);
                        } else if (r.emoji.name === "▶") { //--------------Move to the next page
                            if (page === guildEntry.levelSystem.roles.length - 1) {
                                page = 0;
                            } else {
                                page = page + 1;
                            }
                            updateMessage(page);

                        } else if (r.emoji.name === "⏭") { //----------------Move to the last page
                            if (page !== guildEntry.levelSystem.roles.length - 1) {
                                page = guildEntry.roles.reminders.length - 1;
                                updateMessage(page);
                            }
                        } else if (r.emoji.name === "🗑") { //-----------------Remove the current role
                            guildEntry.levelSystem.roles.splice(page, 1);
                            client.guildDatas.set(message.guild.id, guildEntry);
                            if (page === guildEntry.levelSystem.roles.length) {
                                page = guildEntry.levelSystem.roles.length - 1;
                            }
                            if (guildEntry.levelSystem.roles.length === 0) { //If there is nothing left
                                return await interactiveMessage.delete();
                            }
                            updateMessage(page);
                        } else if (r.emoji.name === "❌") { //-------------Close the command
                            collector.stop("User aborted the process");
                            return await interactiveMessage.delete();
                        }
                        await r.remove(message.author.id); //Remove the user reaction
                        //Start a new countdown
                        timeout = setTimeout(async function () {
                            collector.stop("Timeout");
                            return await interactiveMessage.delete();
                        }, 120000);
                    });
                }
            } else if (settings.reply.content === "4") {
                const privacy = await client.awaitReply({
                    message: message,
                    title: ':gear: Server experience privacy',
                    question: 'Choose this server global experience privacy, setting it as public means that this server might appear on the leaderboard```\n[1] - Public\n[2] - Private```'
                });
                if (!privacy) {
                    return await message.channel.send(":x: Command aborted");
                }
                if (isNaN(privacy.reply.content)) {
                    return await message.channel.send(":x: Command aborted");
                }
                if (privacy.reply.content === "1") {
                    await privacy.question.delete();
                    if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await privacy.reply.delete();
                    }
					if (!guildEntry.levelSystem) {
						return await message.channel.send(":x: You must enable the level system at least one time before doing that");
					}
                    guildEntry.levelSystem.public = true;
                    client.guildDatas.set(message.guild.id, guildEntry);
                    return await message.channel.send(":white_check_mark: Alright, i updated this server experience privacy");
                }
                if (privacy.reply.content === "2") {
                    await privacy.question.delete();
                    if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                        await privacy.reply.delete();
                    }
                    guildEntry.levelSystem.public = false;
                    client.guildDatas.set(message.guild.id, guildEntry);
                    return await message.channel.send(":white_check_mark: Alright, i updated this server experience privacy");
                }
                await privacy.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await privacy.reply.delete();
                }
                return await message.channel.send(":x: Command aborted");
            }
        }
        if (args[0] === "on") {
            if (!guildEntry.levelSystem) {
                var isPublic = await client.awaitReply({
                    message: message,
                    title: `:gear: Level system settings`,
                    question: `Do you want this server total exp count to be public? If yes, this server might be displayed on the leaderboard. Answer with \`yes\` to accept or anything else to set is as private`,
                    limit: 60000
                });
                if (!isPublic) {
                    return await message.channel.send(":x: Command aborted");
                }
                var public;
                if (isPublic.reply.content === "yes") {
                    public = true;
                } else {
                    public = false;
                }
                await isPublic.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await isPublic.reply.delete();
                }
                var levelUp = await client.awaitReply({
                    message: message,
                    title: `:gear: Level system settings`,
                    question: 'Which way i should notify people when they level up?```\n[1] - Channel\n[2] - Private message\n[3] - Disable level up notifcations```',
                });
                var levelUpMethod;
                if (!levelUp) {
                    return await message.channel.send(":x: Command aborted");
                } else if (levelUp.reply.content !== "1" && levelUp.reply.content !== "2" && levelUp.reply.content !== "3") {
                    return await message.channel.send(":x: The number you specified is not valid");
                } else if (levelUp.reply.content === "1") {
                    levelUpMethod = "channel";
                } else if (levelUp.reply.content === "2") {
                    levelUpMethod = "dm";
                } else if (levelUp.reply.content === "3") {
                    levelUpMethod = false;
                }
                await levelUp.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await levelUp.reply.delete();
                }
                guildEntry.levelSystem = {
                    id: message.guild.id,
                    enabled: true,
                    public: public,
                    levelUpNotif: levelUpMethod,
                    roles: [],
                    users: [{
                        id: message.author.id,
                        expCount: 0,
                        level: 0
                    }],
                    totalExp: 0
                }
                client.guildDatas.set(message.guild.id, guildEntry);
                return await message.channel.send(":white_check_mark: You're all set ! <:awoo_rainbow:345171973724176385>");
            } else if (guildEntry.levelSystem.enabled) {
                return await message.channel.send(":x: The level system is already enabled on this server ! ");
            } else if (!guildEntry.levelSystem.enabled) {
                var isPublic = await client.awaitReply({
                    message: message,
                    title: `:gear: Level system settings`,
                    question: `Do you want this server total exp count to be public? If yes, this server might be displayed on the leaderboard. Answer with \`yes\` to accept or anything else to set is as private`,
                    limit: 60000
                });
                if (!isPublic) {
                    return await message.channel.send(":x: Command aborted");
                }
                var public;
                if (isPublic.reply.content === "yes") {
                    public = true;
                } else {
                    public = false;
                }
                await isPublic.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await isPublic.reply.delete();
                }
                var levelUp = await client.awaitReply({
                    message: message,
                    title: `:gear: Level system settings`,
                    question: 'Which way i should notify people when they level up?```\n[1] - Channel\n[2] - Private message\n[3] - Disable level up notifcations```',
                });
                var levelUpMethod;
                if (!levelUp) {
                    return await message.channel.send(":x: Command aborted");
                } else if (levelUp.reply.content !== "1" && levelUp.reply.content !== "2" && levelUp.reply.content !== "3") {
                    return await message.channel.send(":x: The number you specified is not valid");
                } else if (levelUp.reply.content === "1") {
                    levelUpMethod = "channel";
                } else if (levelUp.reply.content === "2") {
                    levelUpMethod = "dm";
                } else if (levelUp.reply.content === "3") {
                    levelUpMethod = false;
                }
                await levelUp.question.delete();
                if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
                    await levelUp.reply.delete();
                }
                guildEntry.levelSystem.levelUpNotif = levelUpMethod;
                guildEntry.levelSystem.enabled = true,
                    guildEntry.levelSystem.public = public;
                client.guildDatas.set(message.guild.id, guildEntry);
                return await message.channel.send(":white_check_mark: You're all set ! <:awoo_rainbow:345171973724176385>");
            }
        } else if (args[0] === "off") {
            if (!guildEntry.levelSystem) {
                guildEntry.levelSystem = {
                    id: message.guild.id,
                    enabled: true,
                    public: isPublic,
                    levelUpNotif: "channel",
                    roles: [],
                    users: [{
                        id: message.author.id,
                        expCount: 0,
                        level: 0
                    }],
                    totalExp: 0
                }
                client.guildDatas.set(message.guild.id, guildEntry);
                return await message.channel.send(":x: The level system is already disabled ^^");
            } else if (!guildEntry.levelSystem.enabled) {
                return await message.channel.send(":x: The level system is already disabled ^^");
            }
            guildEntry.levelSystem.enabled = false,
                guildEntry.levelSystem.public = false;
            client.guildDatas.set(message.guild.id, guildEntry);
            return await message.channel.send(":white_check_mark: Alright, the level system is now disabled, and this server exp count has been set as private automatically as well <:awoo_rainbow:345171973724176385>");
        } else if (rolelist) {
            if (guildEntry.levelSystem.roles.length === 0) {
                return await message.channel.send(":x: There is no roles that are set to be assigned on level up on this server");
            }
            guildEntry.levelSystem.roles.forEach(function (role) { //Automatically remove roles that doesnt exist anymore
                if (!message.guild.roles.get(role.id)) {
                    guildEntry.levelSystem.roles.splice(guildEntry.levelSystem.roles.findIndex(function (element) {
                        return element.id === role.id;
                    }), 1);
                }
            });
            var page = 0;
            const interactiveMessage = await message.channel.send({
                embed: {
                    title: ":gear: On level-up roles list",
                    description: "This is the list of the roles i add on specific levels, use :wastebasket: to remove one, :x: to quit this command and the arrows to move through pages",
                    fields: [{
                        name: ":notepad_spiral: Role",
                        value: `${message.guild.roles.get(guildEntry.levelSystem.roles[0].id).name}`,
                        inline: true
                    }, {
                        name: ":up: At level",
                        value: `${guildEntry.levelSystem.roles[0].atLevel}`,
                        inline: true
                    }],
                    footer: {
                        text: `Showing page ${page + 1}/${guildEntry.levelSystem.roles.length}`
                    }
                }
            });
            await interactiveMessage.react("⏮");
            await interactiveMessage.react("◀");
            await interactiveMessage.react("▶");
            await interactiveMessage.react("⏭");
            await interactiveMessage.react("🗑");
            await interactiveMessage.react("❌");
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            var timeout = setTimeout(async function () {
                collector.stop("Timeout");
                return await interactiveMessage.delete();
            }, 120000);
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //Reset the countdown
                async function updateMessage(page) {
                    await interactiveMessage.edit({
                        embed: {
                            title: ":gear: On level-up roles list",
                            description: "This is the list of the roles i add on specific levels, use :wastebasket: to remove one, :x: to quit this command and the arrows to move through pages",
                            fields: [{
                                name: ":notepad_spiral: Content",
                                value: `${message.guild.roles.get(guildEntry.levelSystem.roles[page].id).name}`,
                                inline: true
                    }, {
                                name: ":up: At level",
                                value: `${guildEntry.levelSystem.roles[page].atLevel}`,
                                inline: true
                    }],
                            footer: {
                                text: `Showing page ${page + 1}/${guildEntry.levelSystem.roles.length}`
                            }
                        }
                    });
                }
                if (r.emoji.name === "⏮") { //-----------------Move to the first page
                    if (page !== 0) {
                        page = 0;
                        updateMessage(page);
                    }
                } else if (r.emoji.name === "◀") { //----------------------Move to the previous page
                    if (page === 0) {
                        page = guildEntry.levelSystem.roles.length - 1;
                    } else {
                        page = page - 1;
                    }
                    updateMessage(page);
                } else if (r.emoji.name === "▶") { //--------------Move to the next page
                    if (page === guildEntry.levelSystem.roles.length - 1) {
                        page = 0;
                    } else {
                        page = page + 1;
                    }
                    updateMessage(page);

                } else if (r.emoji.name === "⏭") { //----------------Move to the last page
                    if (page !== guildEntry.levelSystem.roles.length - 1) {
                        page = guildEntry.roles.reminders.length - 1;
                        updateMessage(page);
                    }
                } else if (r.emoji.name === "🗑") { //-----------------Remove the current role
                    guildEntry.levelSystem.roles.splice(page, 1);
                    client.guildDatas.set(message.guild.id, guildEntry);
                    if (page === guildEntry.levelSystem.roles.length) {
                        page = guildEntry.levelSystem.roles.length - 1;
                    }
                    if (guildEntry.levelSystem.roles.length === 0) { //If there is nothing left
                        return await interactiveMessage.delete();
                    }
                    updateMessage(page);
                } else if (r.emoji.name === "❌") { //-------------Close the command
                    collector.stop("User aborted the process");
                    return await interactiveMessage.delete();
                }
                await r.remove(message.author.id); //Remove the user reaction
                //Start a new countdown
                timeout = setTimeout(async function () {
                    collector.stop("Timeout");
                    return await interactiveMessage.delete();
                }, 120000);
            });
        }
    } catch (err) {
        var guild;
        var detailledError; //that stuff is to avoid undefined logs
        if (message.guild) {
            guild = message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n**Channel:** " + message.channel.name;
        } else {
            guild = "DM"
        }
        if (err.stack) {
            detailledError = err.stack;
        } else {
            detailledError = "None";
        }
        console.error("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Log to the console           
        return await client.channels.get(client.errorLog).send("**Server**: " + guild + "\n**Author**: " + message.author.username + "#" + message.author.discriminator + "\n**Triggered Error**: " + err + "\n**Command**: " + client.commands.get(this.help.name).help.name + "\n**Message**: " + message.content + "\n**Detailled log:** " + detailledError); //Send a detailled error log to the #error-log channel of the support server
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["ls"],
    disabled: false,
    permLevel: 2
};

exports.help = {
    name: 'levelsystem',
    description: 'Manage the level system which gives stuff based on activity, disabled by default',
    usage: 'levelsystem on/off',
    category: 'settings',
    detailledUsage: '`{prefix}levelsystem on` Will enable the level system, members of this server will gain xp and levels, and Felix will give them roles if you set it that way\n`{prefix}levelsystem off`\n`{prefix}levelsystem` Access the level system settings (Server privacy, roles to give...)\n`{prefix}levelsystem rolelist` Will return a list of the roles added on level up in which you can select a role to remove from the list'
};
