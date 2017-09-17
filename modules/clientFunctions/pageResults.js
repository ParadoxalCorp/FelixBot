module.exports = async(client) => {
    client.pageResults = async function(params) {
        return new Promise(async(resolve, reject) => {
            var parameters = {
                results: false,
                size: 10
            }
            if (!params || !params.results) return reject("FunctionCallError: The results parameter must be provided");
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