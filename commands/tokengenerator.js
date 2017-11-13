class TokenGenerator {
    constructor() {
        this.help = {
            name: 'tokengenerator',
            category: 'admin',
            usage: 'tokengenerator',
            parameters: `[new] [Public||Private?=Public] [User_ID]] || [list [Public||Private?=Public]] || [revoke [User_ID || token]]`,
            description: `[Owner only] Generate API tokens`,
            detailledUsage: "`{prefix}tokengenerator new public 140149699486154753` Will generate and save a public token for the specified user id(user is just to retrieve tokens)"
        };
        this.conf = {
            aliases: ['token', `generatetoken`],
            ownerOnly: true
        }
    }

    run(client, message, args) {
        return new Promise(async(resolve, reject) => {
            try {
                const tokens = client.clientData.has("tokens") ? client.clientData.get("tokens") : { public: [], private: [] };

                if (message.content.search(/new/gim) !== -1) {
                    let isPublic = message.content.search(/public/gim) ? true : (message.content.search(/private/gim) ? false : true);
                    let id = args.filter(a => !isNaN(a) && a.length >= 17);
                    if (!id[0]) return resolve(await client.createMessage(message.channel.id, `:x: You need to provide a user id !`));
                    //Very cheap token generator
                    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '_', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', '$', 'u', 'r', 's', 't', 'u', 'v', '-', 'w', 'x', 'y', 'z'];
                    let token = new String();
                    for (let i = 0; i < 156; i++) {
                        if (i % 25 === 0 && i !== 0) token += ".";
                        else {
                            let random = Math.random();
                            if (random < 0.50) {
                                let randomLetter = Math.floor(Math.random() * ((alphabet.length - 1) + 1));
                                if (random < 0.25) token += alphabet[randomLetter].toUpperCase();
                                else token += alphabet[randomLetter];
                            } else token += Math.floor(Math.random() * (9 + 1));
                        }
                    }
                    tokens[isPublic ? "public" : "private"].push({ token: token, user: id });
                    client.clientData.set("tokens", tokens);
                    resolve(await client.createMessage(message.channel.id, {
                        embed: {
                            description: `Generated and stored the following token: \`\`\`js\n"${token}"\`\`\``
                        }
                    }));
                } else if (message.content.search(/list/gim) !== -1) {
                    let isPublic = message.content.search(/public/gim) ? true : (message.content.search(/private/gim) ? false : true);
                    let tokenList = isPublic ? tokens.public.map(t => `${t.user}: ${t.token}`).join("\n") : tokens.private.map(t => `${t.user}: ${t.token}`).join("\n");
                    resolve(await client.createMessage(message.channel.id, {
                        embed: {
                            description: "```" + tokenList + "```"
                        }
                    }));
                } else if (message.content.search(/revoke/gim) !== -1) {
                    let id = args.filter(a => !isNaN(a) && a.length >= 17);
                    let token = args.filter(a => a.length === 156);
                    if (!id[0] && !token[0]) return resolve(await client.createMessage(message.channel.id, `:x: You need to specify a token or a user id to revoke`));
                    if (token[0]) {
                        let isPublic = tokens.private.find(t => t.token === token[0]) ? false : true;
                        let tokenPos = tokens.private.findIndex(t => t.token === token[0]) ? tokens.private.findIndex(t => t.token === token[0]) : tokens.public.findIndex(t => t.token === token[0]);
                        if (!tokenPos) return resolve(await client.createMessage(message.channel.id, `:x: That token does not exist`));
                        tokens[isPublic ? "public" : "private"].splice(tokenPos, 1);
                        client.clientData.set("tokens", tokens);
                        resolve(await client.createMessage(message.channel.id, `:white_check_mark: Successfully revoked the token \`${token[0]}\``))
                    } else if (id[0]) {
                        if (!tokens.private.find(t => t.user === id[0]) && !tokens.public.find(t => t.user === id[0])) return resolve(await client.createMessage(message.channel.id, `:x: There is no token assigned to this user id`));
                        for (let i = 0; i < tokens.private.length + tokens.public.length; i++) {
                            let where = i < tokens.private.length ? "private" : "public";
                            if (tokens[where][i].user === id[0]) tokens[where].splice(i, 1);
                        }
                        client.clientData.set("tokens", tokens);
                        resolve(await client.createMessage(message.channel.id, `:white_check_mark: Successfully revoked all of the tokens of the specified user`));
                    }
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new TokenGenerator();