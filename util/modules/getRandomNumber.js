'use strict';

/**
 * Get a random in the specified interval
 * @param {number} min - The minimum 
 * @param {number} max - The maximum 
 * @returns {number} A random number between min (inclusive) and max (exclusive)
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
module.exports = getRandomNumber;