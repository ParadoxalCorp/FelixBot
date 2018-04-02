//Actually that may reveal itself useful at some point, so let's keep it

class IPCHandler {
    constructor(client) {
        this.requests = new client.Collection;
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
        }
        if (process.argv.includes("--dev")) {
            process.send({ name: "log", msg: `Received the message ${message.type} from cluster ${message.clusterID}: ${JSON.stringify(message, null, 2)}` });
        }
    }

    _allClustersAnswered(id) {
        return this.requests.get(id).responses.length >= (this.clusterCount || 1) ? true : false;
    }
}

module.exports = IPCHandler;