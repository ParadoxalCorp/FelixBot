const unirest = require('unirest');

class Request {
    /**
     * Async GET request
     * @param {string} url The url of the page to get
     * @param {Object} header An object containing the header and the header value
     * @param {string} header.header The header
     * @param {string} header.value The header value
     */
    get(url, header) {
        return new Promise(async(resolve, reject) => {
            unirest.get(url)
                .header(`${header ? header.header : null}`, `${header ? header.value : null}`)
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
    put(url, data, header) {
        return new Promise(async(resolve, reject) => {
            unirest.put(url)
                .header(`${header ? header.header : null}`, `${header ? header.value : null}`)
                .send(data)
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
     */
    post(url, data, header) {
        return new Promise(async(resolve, reject) => {
            unirest.put(url)
                .header(`${header ? header.header : null}`, `${header ? header.value : null}`)
                .send(data)
                .end(response => resolve(response));
        });
    }
}

module.exports = new Request();