'use strict';

/**
 * @typedef LevelDetails 
 * @prop {number} level The level  
 * @prop {number} nextLevel The next level (basically level + 1 yes)
 * @prop {number} thisLevelExp The experience required to reach this level
 * @prop {number} nextLevelExp The experience required to reach the next level
 */


/**
 * @param {object} client - The client instance
 * @param {number} level - The level to get the details from
 * @return {LevelDetails} An object containing data about the experience required for this level and the next level
 */
const getLevelDetails = (client, level) => {
    return {
        level: level,
        nextLevel: level + 1,
        thisLevelExp: Math.floor(client.config.options.experience.baseXP * (level ** client.config.options.experience.exponent)),
        nextLevelExp: Math.floor(client.config.options.experience.baseXP * ((level + 1) ** client.config.options.experience.exponent))
    };
};

module.exports = getLevelDetails;