const googleTranslate = require("google-translate-api");

class Uinfo {
    constructor() {
        this.help = {
            name: 'translate',
            category: 'misc',
            description: 'Translate the provided text to the specified language using google translate',
            usage: "`{prefix}translate \"hello\" en:fr` Will translate `hello` from english to french\n`{prefix}translate \"hello\" fr` Will try to automatically detect from which language it is and translate it to french"
        }
        this.conf = {
            requireDB: false,

            guildOnly: true,
            aliases: ["trans"]
        };
    }

    run(client, message, args) {
        return new Promise(async (resolve, reject) => {
            try {
                args = args.join(" ").split('"').filter(a => a !== "").map(a => a.trim());
                if (args[0] && args[0].includes(':') && !new RegExp(/\s+/g).test(args[0])) args.push(args.shift().trim());
                let textToTranslate = args[0];
                if (!args[1] || !textToTranslate) return resolve(await message.channel.createMessage(`:x: You need to at least specify the text to translate and the language to which i should translate it`));
                let sourceLang = args[1].split(":")[0].toLowerCase().trim();
                let targetLang = args[1].split(":")[1] ? args[args[1].includes('"') ? 0 : 1].split(":")[1].toLowerCase().trim() : false;
                //If only one language iso is specified, take it as the target
                if (!targetLang) {
                    targetLang = sourceLang;
                    sourceLang = undefined;
                }
                let translated = await googleTranslate(textToTranslate, {
                    from: sourceLang,
                    to: targetLang
                }).catch(async (err) => {
                    return resolve(await message.channel.createMessage(`:x: One of the specified language is not supported or the syntax is incorrect, it must be the following syntax: \`${message.guild ? client.guildData.get(message.guild.id).generalSettings.prefix : client.config.prefix}translate "text to translate" SOURCE_LANGUAGE_ISO:TARGET_LANGUAGE_ISO\` (see the help for examples)`));
                });
                resolve(await message.channel.createMessage({
                    embed: {
                        title: `:white_check_mark: Text translated from ${translated.from.language.iso.toUpperCase()} to ${targetLang.toUpperCase()}\n`,
                        description: "```" + translated.text + "```"
                    }
                }));
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Uinfo();