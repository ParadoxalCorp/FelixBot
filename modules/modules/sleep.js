module.exports = async(client) => {
    /**
     * Equivalent for other languages sleep function, use promises to reproduce tho
     * @param {Number} ms Time in milliseconds to wait
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    client.sleep = sleep;
}