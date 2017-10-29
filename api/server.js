'use strict';

const Hapi = require('hapi');

exports.launch = async(client, readdir) => {

    client.logger.draft('serverStart', 'create', `Initializing server endpoints`);
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
        client.logger.draft('serverStart', 'end', `Server endpoints launched ${err ? '' : 'at ' + server.info.uri}`, err ? false : true);
        await client.sleep(2000); //Basically to dont break logs
        if (err) console.error(err);
    });
}