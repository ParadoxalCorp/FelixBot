module.exports = async(client, oldMessage, message) => {
    //Basically emit a new message if the old message is cached(meaning its recent enough) 
    if (oldMessage) client.emit("messageCreate", oldMessage);
}