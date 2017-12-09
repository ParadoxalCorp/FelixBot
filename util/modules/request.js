const unirest = require('unirest');

class Request {
    /**
     * Async GET request
     * @param {string} url The url of the page to get
     * @param {Object} header An object containing the header and the header value
     * @param {string} header.header The header
     * @param {string} header.value The header value
     */
    get(url, header, timeout = 3000) {
        return new Promise(async(resolve, reject) => {
            unirest.get(url)
                .header(`${header ? header.header : null}`, `${header ? header.value : null}`)
                .timeout(timeout)
                .end(response => resolve(response));
        });
    }

    /**
     * Async PUT request
     * @param {string} url The url of the page where to PUT
     * @param {*} data The data to send
     * @param {Object} header An object containing the header and the header value
     * @param {string} header.header The header
     * @param {string} header.value The header value
     */
    put(url, data, header, timeout = 3000) {
        return new Promise(async(resolve, reject) => {
            unirest.put(url)
                .header(`${header ? header.header : null}`, `${header ? header.value : null}`)
                .send(data)
                .timeout(timeout)
                .end(response => resolve(response));
        });
    }

    /**
     * Async POST request
     * @param {string} url The url of the page where to POST
     * @param {*} data The data to send
     * @param {Object} header An object containing the header and the header value
     * @param {string} header.header The header
     * @param {string} header.value The header value
     * @param {Boolean} [json] Whether or not this should be sent with a application/json header
     */
    post(url, data, header, timeout = 3000, json) {
        return new Promise(async(resolve, reject) => {
            unirest.post(url)
                .header(`${header ? header.header : null}`, `${header ? header.value : null}`)
                .header(`${json ? "Content-Type" : null}`, `${json ? "application/json" : null}`)
                .send(data)
                .timeout(timeout)
                .end(response => resolve(response));
        });
    }
}

module.exports = new Request();