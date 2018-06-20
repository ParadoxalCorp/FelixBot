'use strict';

/**
 * Check if a NPM module is installed
 * @param {string} name - The module name 
 * @returns {boolean} Whether the module is installed or not
 */
const moduleIsInstalled = (name) => {
    try {
        require(name);
        return true;
    } catch (err) {
        return false;
    }
};

module.exports = moduleIsInstalled;