const fs = require("fs-extra");

module.exports = async(client) => {
    /**
     * Load the backup of core-data into the current one
     */
    async function loadBackup() {
        return new Promise(async(resolve, reject) => {
            let jsonData = await fs.readFile(`./config/core-data.json`).catch(err => { return reject(err) });
            console.log(typeof jsonData);
            jsonData = jsonData.exists ? JSON.parse(jsonData) : {};
            client.clientData.forEach(c => { jsonData[c.key] = c });
            fs.writeFile(`./config/core-data.json`, JSON.stringify(jsonData), (err) => {
                if (err) return reject(err);
            });
            resolve(JSON.stringify(jsonData));
        });
    }
    client.loadBackup = loadBackup;
}