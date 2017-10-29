exports.run = async(client, message) => {
    return new Promise(async(resolve, reject) => {
        try {
            const userTags = client.tagData.filter(t => t.author == message.author.id);
            let modes = ['Navigation mode, you can enter the edition mode with :heavy_plus_sign:', 'Edition mode, you can write down the name of the tag to add (only first word will be used)'];
            const mainObject = function(page, embedFields, mode) {
                return {
                    embed: {
                        title: ':gear: Tags settings',
                        description: `Use the arrows to navigate through your tags list, you can use :heavy_plus_sign: to start typing the name of a tag to add or :wastebasket: to remove one. You can end this command at any moment with :x:.\n\n**Mode:** ${mode}`,
                        fields: embedFields[page],
                        footer: {
                            text: `Showing page ${page + 1}/${userTags.size} | Time limit: 120 seconds`
                        }
                    }
                }
            }
            let tagsFields = [];
            userTags.forEach(tag => { //Build tags fields
                let guild = ':x:';
                if (tag.guild && client.guilds.has(tag.guild)) guild = client.guilds.get(tag.guild).name;
                tagsFields.push([{
                    name: ':pencil2: Name',
                    value: `${tag.name}`,
                    inline: true
                }, {
                    name: ':notepad_spiral: Content',
                    value: `${tag.content.substr(0, 124)}`,
                    inline: true
                }, {
                    name: `:spy: Privacy`,
                    value: `${tag.privacy}`,
                    inline: true
                }, {
                    name: ':computer: Server',
                    value: `${guild}`,
                    inline: true
                }]);
            });
            const secondaryObject = function(mode) {
                return {
                    embed: {
                        title: ':gear: Tags settings',
                        description: `Use the arrows to navigate through your tags list, you can use :heavy_plus_sign: to start typing the name of a tag to add or :wastebasket: to remove one, you can end this command at any moment with :x:.\n\n**Mode:** ${mode}\n\nSeems like you didn't created any tag yet, start by adding one with :heavy_plus_sign: !`,
                    }
                }
            }
            let page = 0; //current page
            var interactiveMessage;
            if (userTags.size < 1) interactiveMessage = await message.channel.send(secondaryObject(modes[0]));
            else interactiveMessage = await message.channel.send(mainObject(page, tagsFields, modes[0]));
            const collector = interactiveMessage.createReactionCollector((reaction, user) => user.id === message.author.id);
            let pageReactions = ["⏮", "◀", "▶", "⏭", "🕵", "➕", "🗑", "❌"];
            for (let i = 0; i < pageReactions.length; i++) {
                await interactiveMessage.react(pageReactions[i]);
            }
            var timeout = setTimeout(async function() {
                collector.stop("timeout");
            }, 120000);
            let isCollecting = false;
            collector.on('collect', async(r) => {
                clearTimeout(timeout); //reset the timeout
                if (tagsFields.length) var currentTag = client.tagData.get(tagsFields[page][0].value);
                if (tagsFields.length) { //Dont let people 'navigate' through pages if there's no tags
                    if (r.emoji.name === '⏮') { //Move to first page
                        if (page !== 0) { //Dont edit for nothing
                            page = 0;
                            await interactiveMessage.edit(mainObject(page, tagsFields, modes[0]));
                        }
                    } else if (r.emoji.name === '◀') { //Move to previous page
                        if (page === 0) page = tagsFields.length - 1;
                        else page--;
                        await interactiveMessage.edit(mainObject(page, tagsFields, modes[0]));
                    } else if (r.emoji.name === '▶') { //Move to next page
                        if (page === tagsFields.length - 1) page = 0;
                        else page++;
                        await interactiveMessage.edit(mainObject(page, tagsFields, modes[0]));
                    } else if (r.emoji.name === '⏭') { //Move to last page
                        if (!page !== tagsFields.length - 1) { //Dont edit if already at last page
                            page = tagsFields.length - 1;
                            await interactiveMessage.edit(mainObject(page, tagsFields, modes[0]));
                        }
                    }
                }
                if (r.emoji.name === "🕵") {
                    if (currentTag) {
                        if (currentTag.privacy === 'Server-wide') {
                            currentTag.privacy = 'Private';
                            currentTag.guild = false;
                            tagsFields[page][3].value = ':x:';
                        } else if (currentTag.privacy === 'Private') currentTag.privacy = 'Public';
                        else if (currentTag.privacy === 'Public') {
                            currentTag.privacy = 'Server-wide';
                            currentTag.guild = message.guild.id;
                            tagsFields[page][3].value = message.guild.name;
                        }
                        client.tagData.set(currentTag.name, currentTag);
                        tagsFields[page][2].value = currentTag.privacy;
                        await interactiveMessage.edit(mainObject(page, tagsFields, modes[0]));
                    }
                } else if (r.emoji.name === "➕") {
                    if (!isCollecting) {
                        if (userTags.length < 1) await interactiveMessage.edit(secondaryObject(modes[1]));
                        else await interactiveMessage.edit(mainObject(page, tagsFields, modes[1]));
                        isCollecting = true;
                        let tagName;
                        try {
                            const collectedName = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                time: 120000,
                                errors: ["time"]
                            });
                            let args = collectedName.first().cleanContent.split(/\s+/);
                            tagName = args[0];
                            if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) collectedName.first().delete();
                            collectedName.delete();
                        } catch (e) {
                            collector.stop('timeout');
                        }
                        if (tagName) {
                            isCollecting = false;
                            if (tagName.length > 48) {
                                let tooLongName = await message.channel.send(":x: A tag name can't exceed 48 characters");
                                tooLongName.delete(5000);
                            } else if (client.tagData.has(tagName)) {
                                let tagAlreadyIn = await message.channel.send(":x: This tag already exist !");
                                tagAlreadyIn.delete(5000);
                            } else if (tagName.length <= 48 && !client.tagData.has(tagName)) {
                                let tagContent;
                                let enterContent = await message.channel.send({
                                    embed: {
                                        description: 'You can now enter the content of the tag',
                                        footer: {
                                            text: 'Time limit: 120 seconds'
                                        }
                                    }
                                });
                                try {
                                    const collectedContent = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                        max: 1,
                                        time: 120000,
                                        errors: ["time"]
                                    });
                                    tagContent = collectedContent.first().cleanContent;
                                    if (message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) collectedContent.first().delete();
                                    enterContent.delete();
                                } catch (e) {
                                    enterContent.delete();
                                    collector.stop('timeout');
                                }
                                client.tagData.set(tagName, {
                                    author: message.author.id,
                                    name: tagName,
                                    content: tagContent,
                                    privacy: 'Public',
                                    guild: false
                                });
                                tagsFields.push([{
                                    name: ':pencil2: Name',
                                    value: `${tagName}`,
                                    inline: true
                                }, {
                                    name: ':notepad_spiral: Content',
                                    value: `${tagContent.substr(0, 124)}`,
                                    inline: true
                                }, {
                                    name: `:spy: Privacy`,
                                    value: `Public`,
                                    inline: true
                                }, {
                                    name: ':computer: Server',
                                    value: `:x:`,
                                    inline: true
                                }]);
                                page = tagsFields.length - 1;
                                await interactiveMessage.edit(mainObject(page, tagsFields, modes[0]));
                            }
                        }
                    }
                } else if (r.emoji.name === "🗑") { //If deletion, delete
                    if (tagsFields.length > 0) {
                        client.tagData.delete(currentTag.name);
                        tagsFields.splice(page, 1);
                        if (page !== 0) page--;
                        if (tagsFields.length > 0) await interactiveMessage.edit(mainObject(page, tagsFields, modes[0]));
                        else await interactiveMessage.edit(secondaryObject(modes[0]));
                    }
                } else if (r.emoji.name === "❌") { //Abort the command
                    collector.stop("aborted"); //End the collector
                }
                await r.remove(message.author.id); //Delete user reaction
                timeout = setTimeout(async function() {
                    collector.stop("timeout");
                }, 120000); //Restart the timeout
            });
            collector.on('end', async(collected, reason) => { //-------------------------------------------------------------On collector end-------------------------------------
                await interactiveMessage.delete();
            });
        } catch (err) {
            reject(client.emit('commandFail', message, err));
        }
    });
}

exports.conf = {
    disabled: false,
    aliases: ['tag'],
    guildOnly: true
}
exports.help = {
    name: 'tags',
    description: 'You can create new tags, delete some or just take a look at all your fancy tags here !',
    usage: 'tags',
    category: 'misc',
    detailedUsage: 'Tags are basically customized output, to run a tag, use `{prefix}t [tagname]`'
}
exports.shortcut = {
    triggers: new Map([
        ['create_tag', {
            args: 3, //Since '|' is considered as an arg
            script: 'createTag.js',
            help: `Create a new tag, correct syntax should be \`create_tag [new_tag_name] | [new_tag_content]\``
        }],
        ['delete_tag', {
            args: 1,
            script: 'deleteTag.js',
            help: `Delete one of your tags, correct syntax should be \`delete_tag [tag_name]\``

        }],
        ['edit_tag', {
            args: 3,
            script: 'editTag.js',
            help: `Edit one of your tags, correct syntax should be \`edit_tag [tag_name] | [new_tag_content]\``
        }],
        ['edit_tag_privacy', {
            args: 3,
            script: 'editTagPrivacy.js',
            help: `Edit the privacy of one of your tags, correct syntax should be \`edit_tag_privacy [tag_name] | ["Public"/"Private"]\``
        }],
        ['edit_tag_name', {
            args: 3,
            script: 'editTagName.js',
            help: `Edit the name of one of your tags, correct syntax should be \`edit_tag_name [tag_name] | [new_tag_name]\``
        }]
    ])
}