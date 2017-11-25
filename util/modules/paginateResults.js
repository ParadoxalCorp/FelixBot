     /**
      * Split the provided array into multiple arrays of the specified size
      * @param {Array} array The array to split 
      * @param {Number} size The required size for a new array to be created
      */
     function paginateResults(array, size) {
         let result = [];
         let j = 0;
         for (let i = 0; i < Math.ceil(array.length / (size || 10)); i++) {
             let builtPage = [];
             builtPage.push(array.slice(j, j + (size || 10)));
             result.push(builtPage);
             j = j + (size || 10);
         }
         return result;
     }

     module.exports = paginateResults;