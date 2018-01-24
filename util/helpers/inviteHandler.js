class InviteHandler {
    constructor() {};

    handle() {
        const guildData = client.guildData.get(message.guild.id);
        return new Promise(async(resolve, reject) => {
            let invitesCode = this._inviteParser(message);
            if (!invitesCode[0]) return resolve();
            if (!message.guild.members.get(client.user.id).hasPermission("manageMessages")) return resolve();
            if (invitesCode.length > 3) {
                return resolve(message.delete());
            }
            invitesCode.forEach(code => {
                client.getInvite(code).then(invite => {
                    if (!guildData.moderation.inviteFiltering.whitelistedGuilds.includes(invite.guild.id) && invite.guild.id !== message.guild.id && invite.guild.id !== "328842643746324481") {
                        message.delete().catch();
                        //Take further moderation actions 
                    }
                }).catch(err => {
                    message.delete().catch();
                    //Since the invite is invalid, do not take anymore moderation action
                })
            })
        })
    }

    _inviteParser(message) {
        let invitePattern = new RegExp(/https\:\/\/discord\.gg\/[A-Za-z0-9]+|discord\.gg\/[A-Za-z0-9]+/gim);
        let invites = [];
        let matchedAll = false;
        while (!matchedAll) {
            let match = invitePattern.exec(message);
            if (match) {
                invites = invites.concat(match);
                message.replace(match[0], '');
            } else {
                matchedAll = true;
            }
        }
        return invites.map(i => i.substr(i.toLowerCase().indexOf('gg/') + 3));
    }
}

module.exports = async(client, message) => {

}