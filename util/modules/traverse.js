'use strict';

/**
 * Traverse through a given object, calling the callback function with each key that is not an object
 * @param {object} object - The object to traverse in
 * @param {function} callback - A function that will be called for each key of the object that is not an object
 * @param {array} ignore - Optional, an array of strings, being the names of the objects to not traverse through
 * @returns {object} - The given object
 */
const traverse = (object, callback, ignore) => {
    for (const key in object) {
        if (typeof object[key] !== "object" || !ignore || !ignore.includes(key)) {
            if (typeof object[key] !== 'object' || Array.isArray(object[key])) {
                object[key] = callback(object[key]);
            } else {
                traverse(object[key], callback, ignore);
            }
        }
    }
    return object;
};

module.exports = traverse;