const fs = require("fs-extra");

module.exports = async(client) => {
    /**
     * Create a backup of the current core-data json 
     */
    async function createBackup() {
        return new Promise(async(resolve, reject) => {
            let jsonData = await fs.readFile(`./config/core-data.json`).catch(err => { return reject(err) });
            jsonData = JSON.parse(jsonData);
            for (props in jsonData) {
                client.clientData.set(props, jsonData[props]);
            }
            resolve(client.clientData);
        });
    }
    client.createBackup = createBackup;
}