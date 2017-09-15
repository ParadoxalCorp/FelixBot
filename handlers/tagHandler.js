module.exports = async(client, message) => {
    if ((client.userData.get(message.author.id) && client.userData.get(message.author.id).blackListed) && (message.author.id !== "140149699486154753")) return; //Ignore blacklisted users    
    let args = message.content.split(/\s+/);
    args.shift();
    const tagCommand = args[0];
    if (!client.tagData.filter(t => (JSON.parse(t).privacy === "Public") || JSON.parse(t).guild === message.guild.id || (JSON.parse(t).author === message.author.id)).get(tagCommand)) {
        return await message.channel.send(":x: That tag does not exist or is private");
    }
    if (!client.userData.get(message.author.id)) { //Once the tag is confirmed
        client.userData.set(message.author.id, client.defaultUserData(message.author.id));
    }
    return await message.channel.send(client.tagData.get(tagCommand).content);
}