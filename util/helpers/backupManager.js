const backupManager = {};

backupManager.loadBackup = require(`./loadBackup.js`);
backupManager.createBackup = require(`./createBackup.js`);

module.exports = backupManager;