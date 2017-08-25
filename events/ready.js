module.exports = client => {
    console.log("--------------------------------------");
    console.log('[!]Connecting... \n[!]Please wait!');
    const status = `f!help for commands ` /*| Shard ${client.shard.id}/${client.shard.count}`*/;
    client.user.setPresence({ game: { name: status, type: 0} });
};
