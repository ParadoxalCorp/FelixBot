<a name="Collection"></a>

## Collection ⇐ <code>Map</code>
an ID, for significantly improved performance and ease-of-use. discord.js rather than Arrays for anything that has

**Kind**: global class
**Extends**: <code>Map</code>

* [Collection](#Collection) ⇐ <code>Map</code>
    * [.array()](#Collection+array) ⇒ <code>Array</code>
    * [.keyArray()](#Collection+keyArray) ⇒ <code>Array</code>
    * [.first([amount])](#Collection+first) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
    * [.firstKey([amount])](#Collection+firstKey) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
    * [.last([amount])](#Collection+last) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
    * [.lastKey([amount])](#Collection+lastKey) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
    * [.random([amount])](#Collection+random) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
    * [.randomKey([amount])](#Collection+randomKey) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
    * [.findAll(prop, value)](#Collection+findAll) ⇒ <code>Array</code>
    * [.find(propOrFn, [value])](#Collection+find) ⇒ <code>\*</code>
    * [.exists(propOrFn, [value])](#Collection+exists) ⇒ <code>boolean</code>
    * [.filter(fn, [thisArg])](#Collection+filter) ⇒ [<code>Collection</code>](#Collection)
    * [.filterArray(fn, [thisArg])](#Collection+filterArray) ⇒ <code>Array</code>
    * [.map(fn, [thisArg])](#Collection+map) ⇒ <code>Array</code>
    * [.some(fn, [thisArg])](#Collection+some) ⇒ <code>boolean</code>
    * [.every(fn, [thisArg])](#Collection+every) ⇒ <code>boolean</code>
    * [.reduce(fn, [initialValue])](#Collection+reduce) ⇒ <code>\*</code>
    * [.clone()](#Collection+clone) ⇒ [<code>Collection</code>](#Collection)
    * [.concat(...collections)](#Collection+concat) ⇒ [<code>Collection</code>](#Collection)
    * [.deleteAll()](#Collection+deleteAll) ⇒ <code>Array.&lt;Promise&gt;</code>
    * [.equals(collection)](#Collection+equals) ⇒ <code>boolean</code>
    * [.sort([compareFunction])](#Collection+sort) ⇒ [<code>Collection</code>](#Collection)

<a name="Collection+array"></a>

### collection.array() ⇒ <code>Array</code>
`Array.from(collection.values())` instead.aviour, use `[...collection.values()]` orge the length of the array

**Kind**: instance method of [<code>Collection</code>](#Collection)
<a name="Collection+keyArray"></a>

### collection.keyArray() ⇒ <code>Array</code>
`Array.from(collection.keys())` instead.ehaviour, use `[...collection.keys()]` orange the length of the array

**Kind**: instance method of [<code>Collection</code>](#Collection)
<a name="Collection+first"></a>

### collection.first([amount]) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
Obtains the first value(s) in this collection.

**Kind**: instance method of [<code>Collection</code>](#Collection)
amount is negative  *</code> \| <code>Array.&lt;\*&gt;</code> - A single value if no amount is provided or an array of values, starting from the end if

| Param | Type | Description |
| --- | --- | --- |
| [amount] | <code>number</code> | Amount of values to obtain from the beginning |

<a name="Collection+firstKey"></a>

### collection.firstKey([amount]) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
Obtains the first key(s) in this collection.

**Kind**: instance method of [<code>Collection</code>](#Collection)
amount is negative  *</code> \| <code>Array.&lt;\*&gt;</code> - A single key if no amount is provided or an array of keys, starting from the end if

| Param | Type | Description |
| --- | --- | --- |
| [amount] | <code>number</code> | Amount of keys to obtain from the beginning |

<a name="Collection+last"></a>

### collection.last([amount]) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
mechanism applies here as well.is collection. This relies on [array](#Collection+array), and thus the caching

**Kind**: instance method of [<code>Collection</code>](#Collection)
amount is negative  *</code> \| <code>Array.&lt;\*&gt;</code> - A single value if no amount is provided or an array of values, starting from the end if

| Param | Type | Description |
| --- | --- | --- |
| [amount] | <code>number</code> | Amount of values to obtain from the end |

<a name="Collection+lastKey"></a>

### collection.lastKey([amount]) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
mechanism applies here as well. collection. This relies on [keyArray](#Collection+keyArray), and thus the caching

**Kind**: instance method of [<code>Collection</code>](#Collection)
amount is negative  *</code> \| <code>Array.&lt;\*&gt;</code> - A single key if no amount is provided or an array of keys, starting from the end if

| Param | Type | Description |
| --- | --- | --- |
| [amount] | <code>number</code> | Amount of keys to obtain from the end |

<a name="Collection+random"></a>

### collection.random([amount]) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
mechanism applies here as well.is collection. This relies on [array](#Collection+array), and thus the caching

**Kind**: instance method of [<code>Collection</code>](#Collection)
**Returns**: <code>\*</code> \| <code>Array.&lt;\*&gt;</code> - A single value if no amount is provided or an array of values

| Param | Type | Description |
| --- | --- | --- |
| [amount] | <code>number</code> | Amount of values to obtain randomly |

<a name="Collection+randomKey"></a>

### collection.randomKey([amount]) ⇒ <code>\*</code> \| <code>Array.&lt;\*&gt;</code>
mechanism applies here as well. collection. This relies on [keyArray](#Collection+keyArray), and thus the caching

**Kind**: instance method of [<code>Collection</code>](#Collection)
**Returns**: <code>\*</code> \| <code>Array.&lt;\*&gt;</code> - A single key if no amount is provided or an array

| Param | Type | Description |
| --- | --- | --- |
| [amount] | <code>number</code> | Amount of keys to obtain randomly |

<a name="Collection+findAll"></a>

### collection.findAll(prop, value) ⇒ <code>Array</code>
(`item[prop] === value`).ere their specified property's value is identical to the given value

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| prop | <code>string</code> | The property to test against |
| value | <code>\*</code> | The expected value |

**Example**
```js
collection.findAll('username', 'Bob');
```
<a name="Collection+find"></a>

### collection.find(propOrFn, [value]) ⇒ <code>\*</code>
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get) for details.</warn>

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| propOrFn | <code>string</code> \| <code>function</code> | The property to test against, or the function to test with |
| [value] | <code>\*</code> | The expected value - only applicable and required if using a property for the first argument |

**Example**
```js
collection.find('username', 'Bob');
```
**Example**
```js
collection.find(val => val.username === 'Bob');
```
<a name="Collection+exists"></a>

### collection.exists(propOrFn, [value]) ⇒ <code>boolean</code>
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has) for details.</warn>

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| propOrFn | <code>string</code> \| <code>function</code> | The property to test against, or the function to test with |
| [value] | <code>\*</code> | The expected value - only applicable and required if using a property for the first argument |

**Example**
```js
}console.log('user here!');name', 'Bob')) {
```
**Example**
```js
}console.log('user here!');=> user.username === 'Bob')) {
```
<a name="Collection+filter"></a>

### collection.filter(fn, [thisArg]) ⇒ [<code>Collection</code>](#Collection)
but returns a Collection instead of an Array.g/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function used to test (should return a boolean) |
| [thisArg] | <code>Object</code> | Value to use as `this` when executing function |

<a name="Collection+filterArray"></a>

### collection.filterArray(fn, [thisArg]) ⇒ <code>Array</code>
[Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function used to test (should return a boolean) |
| [thisArg] | <code>Object</code> | Value to use as `this` when executing function |

<a name="Collection+map"></a>

### collection.map(fn, [thisArg]) ⇒ <code>Array</code>
[Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function that produces an element of the new array, taking three arguments |
| [thisArg] | <code>\*</code> | Value to use as `this` when executing function |

<a name="Collection+some"></a>

### collection.some(fn, [thisArg]) ⇒ <code>boolean</code>
[Array.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some).

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function used to test (should return a boolean) |
| [thisArg] | <code>Object</code> | Value to use as `this` when executing function |

<a name="Collection+every"></a>

### collection.every(fn, [thisArg]) ⇒ <code>boolean</code>
[Array.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function used to test (should return a boolean) |
| [thisArg] | <code>Object</code> | Value to use as `this` when executing function |

<a name="Collection+reduce"></a>

### collection.reduce(fn, [initialValue]) ⇒ <code>\*</code>
[Array.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function used to reduce, taking four arguments; `accumulator`, `currentValue`, `currentKey`, and `collection` |
| [initialValue] | <code>\*</code> | Starting value for the accumulator |

<a name="Collection+clone"></a>

### collection.clone() ⇒ [<code>Collection</code>](#Collection)
Creates an identical shallow copy of this collection.

**Kind**: instance method of [<code>Collection</code>](#Collection)
**Example**
```js
const newColl = someColl.clone();
```
<a name="Collection+concat"></a>

### collection.concat(...collections) ⇒ [<code>Collection</code>](#Collection)
Combines this collection with others into a new collection. None of the source collections are modified.

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| ...collections | [<code>Collection</code>](#Collection) | Collections to merge |

**Example**
```js
const newColl = someColl.concat(someOtherColl, anotherColl, ohBoyAColl);
```
<a name="Collection+deleteAll"></a>

### collection.deleteAll() ⇒ <code>Array.&lt;Promise&gt;</code>
Calls the `delete()` method on all items that have it.

**Kind**: instance method of [<code>Collection</code>](#Collection)
<a name="Collection+equals"></a>

### collection.equals(collection) ⇒ <code>boolean</code>
the collections may be different objects, but contain the same data.eother.

**Kind**: instance method of [<code>Collection</code>](#Collection)
**Returns**: <code>boolean</code> - Whether the collections have identical contents

| Param | Type | Description |
| --- | --- | --- |
| collection | [<code>Collection</code>](#Collection) | Collection to compare with |

<a name="Collection+sort"></a>

### collection.sort([compareFunction]) ⇒ [<code>Collection</code>](#Collection)
The sort is not necessarily stable. The default sort order is according to string Unicode code points.

**Kind**: instance method of [<code>Collection</code>](#Collection)

| Param | Type | Description |
| --- | --- | --- |
| [compareFunction] | <code>function</code> | Specifies a function that defines the sort order. If omitted, the collection is sorted according to each character's Unicode code point value, according to the string conversion of each element. |