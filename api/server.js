'use strict';

const Hapi = require('hapi');
const logger = require('../util/modules/logger');
const sleep = require('../util/modules/sleep');
const readdir = require('fs-extra').readdir;
const fs = require(`fs-extra`);


exports.launch = async(client) => {
    return new Promise(async(resolve, reject) => {

        const port = process.env.PORT || 8080;
        const server = new Hapi.Server();

        server.connection({ port: port })

        server.route({
            method: 'GET',
            path: '/api',
            handler: (req, reply) => {
                reply(`Felix's API is up`).code(200)
            }
        });

        //Load all endpoints
        const endpoints = await readdir('./api/endpoints');
        endpoints.forEach(e => {
            require(`./endpoints/${e}`)(client, server);
        });

        server.start(async(err) => {
            await sleep(2000); //Basically to dont break logs
            if (err) {
                reject(err);
                client.emit("error", err);
            } else resolve(server);
        });
    });
}