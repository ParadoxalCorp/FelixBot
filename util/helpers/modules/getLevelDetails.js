/**
 * 
 * @param {*} client - The client instance
 * @param {number} level - The level to get the details from
 * @return {*} An object containing data about the experience required for this level and the next level
 */
const getLevelDetails = (client, level) => {
    return {
        level: level,
        nextLevel: level + 1,
        expTillNextLevel: Math.floor(client.config.options.experience.baseXP * ((level + 1) ** client.config.options.experience.exponent)),
        thisLevelExp: Math.floor(client.config.options.experience.baseXP * (level ** client.config.options.experience.exponent))
    };
};

module.exports = getLevelDetails;