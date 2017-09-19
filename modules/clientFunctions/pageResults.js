module.exports = async(client) => {
    client.pageResults = async function(params) {
        var result = [];
        var j = 0;
        for (var i = 0; i < Math.ceil(params.results.length / (params.size || 10)); i++) {
            var builtPage = [];
            builtPage.push(params.results.slice(j, j + (params.size || 10)));
            result.push(builtPage);
            j = j + (params.size || 10);
        }
        return {
            results: result,
            length: result.length
        };
    }
}