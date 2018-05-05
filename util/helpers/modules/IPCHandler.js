//Actually that may reveal itself useful at some point, so let's keep it

/**
 * @prop {Collection} requests A collection of the current ongoing requests
 * @prop {*} client The client instance given in the constructor
 */
class IPCHandler {
    constructor(client) {
        this.requests = new client.collection();
        this.client = client;
        process.on('message', this._handleIncomingMessage.bind(this));
    }

    /**
     * Dummy method to test the concept
     * @returns {Promise<array>} An array of clusters with their stats
     */
    getSomeStats() {
        const ID = Date.now();
        return new Promise((resolve) => {
            this.requests.set(ID, {
                responses: [],
                resolve: resolve
            });
            this.client.ipc.broadcast("gibbeSomeStats", {
                id: ID,
                type: 'gibbeSomeStats',
                clusterID: this.client.clusterID
            });
        });
    }

    /**
     * 
     * @param {string} type - The type of the file that should be reloaded, either "command", "event" or "module"
     * @param {string} path - The absolute path of the file that should be reloaded
     * @param {string} [name] - If a module, the name of the module 
     * @param {object} [options] - If a module, the options that Reloader.reloadModule() expect
     * @returns {Promise<array>} An array containing the responses of each clusters, if the reload failed in at least one cluster, the promise is rejected
     */
    broadcastReload(type, path, name, options) {
        const ID = `${this.client.getRandomNumber(1000, 10000) + Date.now()}`;
        return new Promise((resolve, reject) => {
            this.requests.set(ID, {
                responses: [],
                resolve: resolve,
                reject: reject
            });
            this.client.ipc.broadcast('reload', {
                id: ID,
                type: 'reload',
                clusterID: this.client.clusterID,
                data: {
                    type: type,
                    path: path,
                    name: name,
                    options: options
                }
            });
        });
    }

    /**
     * Called every time the message event is fired on the process
     * @param {*} message - The message
     * @private
     * @returns {void}
     */
    _handleIncomingMessage(message) {
        switch (message.type) {
            case 'hereAreYourStatsScrub':
                let request = this.requests.get(message.id);
                request.responses.push({
                    clusterID: message.clusterID,
                    data: message.data
                });

                if (this._allClustersAnswered(message.id)) {
                    //Resolve the request and reorder the responses in case it wasn't already
                    request.resolve(request.responses.sort((a, b) => a.clusterID - b.clusterID));
                    this.requests.delete(message.id);
                }
                break;

            case 'statsUpdate':
                this.client.stats = message.data;
                if (!this.clusterCount) {
                    this.clusterCount = message.data.clusters.length;
                }
                break;

            case 'gibbeSomeStats':
                this.client.ipc.sendTo(message.clusterID, 'hereAreYourStatsScrub', {
                    type: 'hereAreYourStatsScrub',
                    id: message.id,
                    clusterID: this.client.clusterID,
                    data: {
                        baguette: "baguette"
                    }
                });
                break;

            case 'reload':
                let success = true;
                try {
                    if (message.data.type === "event") {
                        this.client.reloader.reloadEventListener(message.data.path);
                    } else if (message.data.type === "command") {
                        this.client.reloader.reloadCommand(message.data.path);
                    } else if (message.data.type === "module") {
                        this.client.reloader.reloadModule(message.data.path, message.data.name, message.data.options);
                    }
                } catch (err) {
                    success = false;
                    this.client.bot.emit('error', err);
                }

                this.client.ipc.sendTo(message.clusterID, 'reloadDone', {
                    type: 'reloadDone',
                    id: message.id,
                    clusterID: this.client.clusterID,
                    data: success
                });
                break;

            case 'reloadDone':
                let reloadRequest = this.requests.get(message.id);
                reloadRequest.responses.push({
                    clusterID: message.clusterID,
                    data: message.data
                });

                if (this._allClustersAnswered(message.id)) {
                    //Resolve the request and reorder the responses in case it wasn't already
                    if (reloadRequest.responses.filter(r => !r.data)[0]) {
                        reloadRequest.reject(reloadRequest.responses.sort((a, b) => a.clusterID - b.clusterID));
                    } else {
                        reloadRequest.resolve(reloadRequest.responses.sort((a, b) => a.clusterID - b.clusterID));
                    }
                    this.requests.delete(message.id);
                }
                break;

        }
        if (process.argv.includes("--dev")) {
            process.send({ name: "log", msg: `Received the message ${message.type} from cluster ${message.clusterID}: ${JSON.stringify(message, null, 2)}` });
        }
    }

    /**
     * Check if all the active clusters responded to a request
     * @param {string} id - The ID of the request to check if all the clusters answered to
     * @returns {boolean} Whether all the active clusters responded to the request
     * @private
     */
    _allClustersAnswered(id) {
        return this.requests.get(id).responses.length >= (this.clusterCount ?
            this.clusterCount - this.client.stats.clusters.filter(c => c.guilds < 1).length : 1) ? true : false;
    }
}

module.exports = IPCHandler;