/**
 * Split the provided array into multiple arrays of the specified size
 * @param {Array} array The array to split 
 * @param {Number} size The required size for a new array to be created
 * @returns {Array<array>} An array of arrays, where each arrays represent a "page"
 */
function paginate(array, size) {
    let result = [];
    let j = 0;
    for (let i = 0; i < Math.ceil(array.length / (size || 10)); i++) {
        result.push(array.slice(j, j + (size || 10)));
        j = j + (size || 10);
    }
    return result;
}

module.exports = paginate;