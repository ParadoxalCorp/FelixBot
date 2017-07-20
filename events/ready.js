module.exports =  client => {
        const servers = client.guilds.array().map(g => g.name).join(',');
        console.log("--------------------------------------");
        console.log('[!]Connecting... \n[!]Please wait!');
        const status = "f!help for commands"
        client.user.setGame(status);
};
