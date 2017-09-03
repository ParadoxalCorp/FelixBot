module.exports = async(client) => {
    client.pageResults = async function(params) {
        return new Promise(async(resolve, reject) => {
            var parameters = {
                message: false,
                results: false,
                text: "",
                size: 10,
                raw: true
            }
            if (!params.message || !params.results) throw "FunctionCallError: The message and results parameters must be provided";
            parameters.message = params.message,
                parameters.results = params.results;
            if (params.text) {
                parameters.text = params.text;
            }
            if (params.size) {
                parameters.size = params.size;
            }
            if (!parameters.raw) {
                throw "Only the raw output is available at this moment"
            } else {
                var result = [];
                const page = await client.searchForParameter({
                    message: parameters.message,
                    parameter: "page"
                });
                var j = 0;
                for (var i = 0; i < Math.ceil(parameters.results.length / parameters.size); i++) {
                    var builtPage = [];
                    builtPage.push(parameters.results.slice(j, j + parameters.size));
                    result.push(builtPage);
                    j = j + parameters.size;
                }
                if (page) {
                    var pageNumber = parameters.message.content.substr(page.position + page.length + 1).trim().substr(0, 2);
                    if (pageNumber === "") {
                        return resolve(":x: You did not enter a page number");
                    }
                    if (typeof result[0][pageNumber - 1] === "undefined") {
                        return resolve(":x: You did not enter a valid number");
                    }
                    return resolve({
                        results: result[0][pageNumber - 1],
                        page: pageNumber + "/" + result.length
                    });
                } else {
                    return resolve({
                        results: result[0][0],
                        page: "1/" + result.length
                    });
                }
            }
        });
    }
}