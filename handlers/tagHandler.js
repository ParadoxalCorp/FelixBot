module.exports = async(client, message) => {
    const tagCommand = message.content.substr(client.guildData.get(message.guild.id).prefix.length + 2).trim();
    if (!client.tagData.filter(t => (JSON.parse(t).privacy === "Global") || (JSON.parse(t).privacy === "Server-wide" && JSON.parse(t).guild === message.guild.id) || (JSON.parse(t).author === message.author.id)).get(tagCommand)) {
        return await message.channel.send(":x: That tag does not exist");
    }
    if (!client.userData.get(message.author.id)) { //Once the tag is confirmed
        client.userData.set(message.author.id, client.defaultUserData(message.author.id));
    }
    if ((client.userData.get(message.author.id).blackListed === "yes") && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users
    return await message.channel.send(client.tagData.get(tagCommand).content);
}