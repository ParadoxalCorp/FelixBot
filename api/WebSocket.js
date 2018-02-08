const WebSocket = require('ws');
const logger = require('../util/modules/logger');

class FelixWebSocket {
    constructor(client) {
        this.client = client;
        this.server = client.server;
    }

    launch() {
        const wss = new WebSocket.Server({
            port: 8090,
            verifyClient: this.verifyConnection.bind(this),
            clientTracking: true
        });

        wss.broadcast = (data) => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }

        wss.on('connection', (ws) => {

            ws.listenToUsers = [],
                ws.listenToGuilds = [],
                ws.isAlive = true;

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.on('message', data => {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    return;
                }
                if (!data.code) {
                    return;
                }


                switch (data.code) {
                    case 20001:
                        //shard.latency will be removed as it is sent, probs cuz it only has a getter. So we copy it and assign the value to a new property
                        this.client.shards.forEach(shard => {
                            shard.ping = shard.latency;
                        });
                        ws.send(JSON.stringify({
                            code: 10001,
                            name: 'Heartbeat ACK',
                            data: {
                                receivedAt: Date.now(),
                                shards: this.client.shards.map(s => s)
                            }
                        }));
                        break;
                    case 20002:
                        if (!data.data || !Array.isArray(data.data.users) || !Array.isArray(data.data.guilds)) {
                            return;
                        }
                        ws.listenToGuilds = data.data.guilds,
                            ws.listenToUsers = data.data.users;
                }
            });

            ws.on('close', (code, reason) => {
                logger.log(`WebSocket connection with ${ws.upgradeReq.host} as ${ws.upgradeReq.headers['user-agent']} has been closed with the code: ${code} (${reason})`)
            });
        });

        //Send updated guild and user data to all clients listening to it
        this.client.on('guildDataUpdate', (guildID, guildData) => {
            wss.clients.forEach((ws) => {
                if (!ws.listenToGuilds.includes(guildID) || !ws.readyState === WebSocket.OPEN) {
                    return;
                }

                ws.send(JSON.stringify({
                    code: 10002,
                    name: 'GDB Update',
                    data: {
                        guildID: guildID,
                        guildData: guildData
                    }
                }));
            });
        });

        this.client.on('userDataUpdate', (userID, userData) => {
            wss.clients.forEach((ws) => {
                if (!ws.listenToUsers.includes(userID) || !ws.readyState === WebSocket.OPEN) {
                    return;
                }

                ws.send(JSON.stringify({
                    code: 10003,
                    name: 'UDB Update',
                    data: {
                        userID: userID,
                        userData: userData
                    }
                }));
            });
        });

        //To prevent broken connections, terminate the connection if the ping has not been answered within 30 seconds 
        this._healthCheckInterval = setInterval(() => {
            wss.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    return ws.terminate();
                }

                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }

    verifyConnection(info, callback) {
        const tokens = this.client.clientData.get("tokens");
        if (tokens.find(t => t.token === info.req.headers.authorization)) {
            logger.log(`Connection to the WebSocket from ${info.req.connection.remoteAddress}(${info.req.headers['host']}) as ${info.req.headers['user-agent']} acknowledged`, 'info');
            callback(true);
        } else {
            callback(false, 403, 'Forbidden');
        }
    }
}

module.exports = FelixWebSocket;