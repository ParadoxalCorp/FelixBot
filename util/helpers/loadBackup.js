const fs = require("fs-extra");

/**
 * Load a backup into the specified file
 * @param {Object} client The client instance
 * @param {string} path The path to the file in which to load the backup (note: file must be JSON)
 * @param {string} [name=file_name] The name of the backup to load, default will be the file name
 */
async function loadBackup(client, path, name) {
    return new Promise(async(resolve, reject) => {
        let jsonData = await fs.readFile(path).catch(err => { return reject(err) });
        name = name ? name : path.split(/\/|\\/gim)[path.split(/\/|\\/gim).length - 1].split('.')[0];
        try {
            jsonData = JSON.parse(jsonData);
        } catch (err) {
            jsonData = {};
        }
        for (props in client.backups.get(name)) {
            jsonData[props] = client.backups.get(name)[props];
        }
        fs.writeFile(path, JSON.stringify(jsonData), (err) => {
            if (err) return reject(err);
        });
        resolve(JSON.stringify(jsonData));
    });
}

module.exports = loadBackup;