module.exports = async(client, message, oldMessage) => {
    //Basically emit a new message if the old message is cached(meaning its recent enough) 
    if (message.channel.messages.has(message.id) && message.channel.messages.get(message.id).author.lastMessageID === message.id) client.emit("messageCreate", message);
}