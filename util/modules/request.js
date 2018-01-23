const axios = require('axios');

class Request {
    /**
     * Async GET request
     * @param {string} url The url of the page to get
     * @param {Object} [headers] A JSON object containing the headers, by default sends Felix's User-Agent
     * @param {Number} [timeout=3000] Time in milliseconds before the request should be aborted
     */
    get(url, headers = { 'User-Agent': 'FelixBot' }, timeout = 6000) {
        return new Promise(async(resolve, reject) => {
            axios({
                method: 'get',
                url: url,
                headers: headers,
                timeout: timeout
            }).then(response => resolve(response)).catch(err => reject(err));
        });
    }

    /**
     * Async PUT request
     * @param {string} url The url of the page where to PUT
     * @param {*} data The data to send
     * @param {Object} [headers] A JSON object containing the headers, by default sends Felix's User-Agent
     * @param {Number} [timeout=3000] Time in milliseconds before the request should be aborted
     */
    put(url, data, headers = { 'User-Agent': 'FelixBot' }, timeout = 6000) {
        return new Promise(async(resolve, reject) => {
            axios({
                method: 'put',
                url: url,
                data: data,
                headers: headers,
                timeout: timeout
            }).then(response => resolve(response)).catch(err => reject(err));
        });
    }

    /**
     * Async POST request
     * @param {String} url The url of the page where to POST
     * @param {*} data The data to send
     * @param {Object} [headers] A JSON object containing the headers, by default sends Felix's User-Agent
     * @param {Number} [timeout=3000] Time in milliseconds before the request should be aborted
     */
    post(url, data, headers = { 'User-Agent': 'FelixBot' }, timeout = 6000) {
        return new Promise(async(resolve, reject) => {
            axios({
                method: 'post',
                url: url,
                data: data,
                headers: headers,
                timeout: timeout
            }).then(response => resolve(response)).catch(err => reject(err));
        });
    }
}

module.exports = new Request();