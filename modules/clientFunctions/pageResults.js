module.exports = async(client) => {
    client.pageResults = async function(message, params) {
        return new Promise(async(resolve, reject) => {
            var parameters = {
                message: false,
                results: false,
                size: 10
            }
            if (!message || !params || !params.results) return reject("FunctionCallError: The message and results parameters must be provided");
            parameters.message = message,
                parameters.results = params.results;
            if (params.size) {
                parameters.size = params.size;
            }
            var result = [];
            var j = 0;
            for (var i = 0; i < Math.ceil(parameters.results.length / parameters.size); i++) {
                var builtPage = [];
                builtPage.push(parameters.results.slice(j, j + parameters.size));
                result.push(builtPage);
                j = j + parameters.size;
            }
            return resolve({
                results: result[0],
                length: result[0].length
            });
        });
    }
}