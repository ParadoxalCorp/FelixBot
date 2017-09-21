module.exports = async(client, oldMessage, newMessage) => {
    //Basically, if the edited message is the latest message of the author, simulate a message event so editing to a command will work
    if (newMessage.author.lastMessageID === newMessage.id) client.emit('message', newMessage);
}