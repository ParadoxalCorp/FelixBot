'use strict';

/**
 * Prompt the user through the terminal
 * @param {string} question - The question to prompt 
 * @returns {Promise<string>} The answer
 */
const prompt = (question) => {
    const rl = require('readline');
    const r = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    return new Promise((resolve) => {
        r.question(question, answer => {
            r.close();
            resolve(answer);
        });
    });
};

module.exports = prompt;