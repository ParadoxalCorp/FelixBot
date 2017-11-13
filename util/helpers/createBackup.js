const fs = require("fs-extra");

/**
 * Create a backup of the current core-data json
 * @param {Object} client The client instance
 * @param {string} path The path to the file to backup (note: file must be JSON)
 * @param {string} [name=file_name] The key name of the backup, default will be the file name 
 */
async function createBackup(client, path, name) {
    return new Promise(async(resolve, reject) => {
        let jsonData = await fs.readFile(path).catch(err => { return reject(err) });
        name = name ? name : path.split(/\/|\\/gim)[path.split(/\/|\\/gim).length - 1].split(".")[0];
        jsonData = JSON.parse(jsonData);
        let backup = {};
        for (props in jsonData) {
            backup[props] = jsonData[props];
        }
        client.backups.set(name, backup);
        resolve(client.backups);
    });
}

module.exports = createBackup;