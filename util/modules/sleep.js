    /**
     * Equivalent for other languages sleep function, use promises to reproduce tho
     * @param {Number} ms - Time in milliseconds to wait
     * @returns {Promise} Promise that will be resolved once the specified milliseconds are elapsed
     */
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    module.exports = sleep;