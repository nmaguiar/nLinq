# nLinq Reference

nLinq queries are made through a series of calls divided into three main areas:

````javascript
var result = $from( aSourceArray )      // FROM part
             .equals("aKey1", aValue)   // WHERE part
             .greater("aKey2", 10)      //
             .select()                  // SELECT part
````

Listed below, there are different combinations of WHERE and SELECT functions that you can use.

## FROM

The input should be primarially an array. If a map is provided it will be converted into an array. For streams it can also be a function.

### Simple array
````javascript
var inData  = [ 1, 2, 3 ];
var outData = $from(inData).select();
// [ 1, 2, 3 ]
````

### Array of maps
````javascript
var inData  = [ { a: 1 }, { a: 2 }, { a: 3 } ];
var outData = $from(inData).select();
// [ {a: 1}, {a: 2}, {a: 3} ]
````

### Simple map

````javascript
var inData  = { a: 1, b: 2, c: 3};
var outData = $from(inData).select();
// [ 1, 2, 3 ]
````

### Map of maps

````javascript
var inData  = { a1: { a: 1 }, a2: { a: 2 }, a3: { a: 3 } };
var outData = $from(inData).select();
// [ { a: 1, _key: "a1" }, { a: 2, _key: "a2" }, { a: 3, _key: "a3"} ]
````

You can specify the key name (instead of "_key") by adding an extra parameter:

````javascript
var inData  = { a1: { a: 1 }, a2: { a: 2 }, a3: { a: 3 } };
var outData = $from(inData).select();
// [ { a: 1, b: "a1" }, { a: 2, b: "a2" }, { a: 3, b: "a3"} ]
````

### A function

````javascript
var ll = 0, sum = 0;
var fn = () => ll++;
$from(fn).limit(5).stream(r => sum += r);
// sum = 10 | ll = 6
````

## WHERE

### Restriciting prefixes and suffixes

Consider the following example:

````javascript
var names = [
  { first: "James", last: "Bond" },
  { first: "James", last: "Scott" },
  { first: "Louis", last: "Bond" }
];
````

| Method | Description | Example |
|------|-------------|---------|
| starts | Restricts string fields prefix to a value | ````$from(names).starts("first", "J").select()```` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"}]_ |
| andStarts | Restricts string fields prefix to a value in addition to the previous restriction | ````$from(names).starts("first", "J").starts("last", "B").select()```` _[{"first":"James","last":"Bond"}]_ |
| notStarts | Restricts string fields that are not prefixed by a value | ````$from(names).notStarts("first", "J").select()```` _[{"first":"Louis","last":"Bond"}]_ |
| andNotStarts | Restricts string fields that are not prefixed by a value in addition to the previous restriction | ````$from(names).starts("first", "J").andNotStarts("last", "S").select()```` _[{"first":"James","last":"Bond"}]_ |
| orStarts | Restricts string fields prefix to a value in alternative to the previous restriction | ````$from(names).starts("first", "Ja").orStarts("last", "Bo").select()```` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"},{"first":"Louis","last":"Bond"}]_ |
| orNotStarts | Restricts string fields prefix that are not prefixed by a value in alternative to the previous restriction | ````$from(names).starts("first", "Ja").orNotStarts("last", "Sc").select()```` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"},{"first":"Louis","last":"Bond"}]_ |
| ends | Restricts string fields suffix to a value | ````$from(names).ends("last", "nd").select()```` _[{"first":"James","last":"Bond"},{"first":"Louis","last":"Bond"}]_ |
| andEnds | Restricts string fields suffix to a value in addition to the previous restriction | ````$from(names).ends("first", "es").andEnds("last", "d").select()```` _[{"first":"James","last":"Bond"}]_ |
| notEnds | Restricts string fields that are not suffixed by a value | ````$from(names).notEnds("last", "Bond").select()```` _[{"first":"James","last":"Scott"}]_ |
| andNotEnds | Restricts string fields that are not suffixed by a value in addition to a previous restriction | ````$from(names).starts("first", "J").andNotEnds("last", "d").select()```` _[{"first":"James","last":"Scott"}]_ |
| orEnds | Restricts string fields that are suffixed by a value in alternative to a previous restriction | ````$from(names).starts("first", "J").orEnds("first", "d").select()```` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"}]_ |
| orNotEnds | Restricts string fields that are not suffixed by a value in alternative to a previous restriction | ````$from(names).starts("first", "J").orNotEnds("first", "s").select()```` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"}]_ |
### Restricting by equality

| Method | Description | Example |
|------|-------------|---------|
| andEquals | | |
| greaterEquals | | |
| andGreaterEquals | | |
| notGreaterEquals | | |
| andNotGreaterEquals | | |
| orGreaterEquals | | |
| orNotGreaterEquals | | |
| lessEquals | | |
| andLessEquals | | |
| andNotLessEquals | | |
| orLessEquals | | |
| orNotLessEquals | | |

### Restricting by value

| Method | Description | Example |
|------|-------------|---------|
| greater | | |
| andGreater | | |
| notGreater | | |
| andNotGreater | | |
| orGreater | | |
| orNotGreater | | |
| less | | | 
| andLess | | | 
| notLess | | | 
| andNotLess | | | 
| orLess | | | 
| orNotLess | | | 
| between | | |
| andBetween| | |
| andNotBetween| | |
| orBetween| | |
| orNotBetween| | |
| betweenEquals | | |
| andBetweenEquals | | |
| andNotBetweenEquals | | |
| orBetweenEquals | | |
| orNotBetweenEquals | | |

### Restricting by value matching

| Method | Description | Example |
|------|-------------|---------|
| contains | | | 
| andContains | | |
| andNotContains | | |
| orContains | | |
| orNotContains | | |
| empty | | | 
| andEmpty | | |
| andNotEmpty | | |
| orEmpty | | |
| orNotEmpty | | |
| match | | |
| andMatch | | |
| andNotMatch | | |
| orMatch | | |
| orNotMatch | | |

### Restricting by value type

| Method | Description | Example |
|------|-------------|---------|
| type | | |
| andType| | |
| andNotType| | |
| orType| | |
| orNotType| | |

| Method | Description | Example |
|------|-------------|---------|
| is | | |
| andIs | | |
| andNotIs | | |
| orIs | | |
| orNotIs | | |
| or | | |
| and | | |
| not | | |
| andNot | | | 
| orNot | | |

### Changing the current result set

| Method | Description | Example |
|------|-------------|---------|
| each | | |
| intersect | | |
| except | | | 
| union | | |
| cartesian | | |
| attach | | |
| sort | | |
| assign | | |
| join | | | 
| skip | | |
| take | | |
| skipTake | | |
| define | | |
| removed | | |
| stream | | |
| streamFn | | |

## SELECT

| Method | Description | Example |
|------|-------------|---------|
| select | Returns all fields from the original array | ````$from(anArray).select()```` |
| select (selected fields) | Returns specific fields with corresponding default values | ````$from(anArray).select({ f1: "n/a", f2: false })````
| select (transform function) | Returns the result of the transformation function | ````$from(anArray).select(r => ({ f1: r.f1, f2: r.a1 + r.a2 }))```` |
| min | Returns the minimum value of a field from the result | ````$from(anArrayOfTemperatures).min("temperature")```` |
| max | Returns the maximum value of a field from the result | ````$from(anArrayOfTemperatures).max("temperature")```` |
| average | Returns the average value of a field from the result | ````$from(anArrayOfTemperatures).average("temperature")```` |
| sum | Returns the sum value of a field from the result | ````$from(anArrayOfFiles).sum("size")```` |
| distinct | Returns an array of distinct values for a specific field from the result | ````$from(anArrayOfMeasures).distinct("measureName")```` |
| group | Returns a map grouping the array of records by a specific field from the result | ````$from(anArrayOfTemperatures).group("city")```` |
| at | Returns a single entry of the result set | ````$from(anArray).at(23)```` |
| all | Returns true if all records from the original array are present on the final result set (false otherwise) | ````$from(anArray).all()```` |
| count | Returns the number of records of the final result set | ````$from(anArray).count()```` |
| countBy | Returns an array counting records per each value after grouping the array of records by a specific field from the result | ````$from(anArray).countBy("groupByFieldName", "countRecordsFieldName", "keyFieldNameToUseOnResult")```` |
| first | Returns the first record of the final result set | ````$from(anArray).first()```` |
| last | Returns the last record of the final result set | ````$from(anArray).last()```` |
| any | Returns true if the result set has any record at all (false otherwise) | ````$from(anArray).any()```` |
| none | Returns true if the result set is empty (false otherwise) | ````$from(anArray).none()```` |
| reverse | Returns a reverse order result set | ````$from(anArray).reverse()```` |
| limit | Returns just a limited amount of records of the result set | ````$from(anArray).limit(5)```` |
| head | Returns a limited amount of the first records of the result set | ````$from(anArray).head(10)```` |
| tail | Returns a limited amount fo the last records of the result set | ````$from(anArray).tail(10)```` |


### Simple select

Return the current result set with the WHERE part applied:

````javascript
var result = $from([ 1, 2, 3 ]).select();
// [ 1, 2, 3 ]
````

### Select the fields

Return the current result set with the WHERE part restricting each map entry on the result to the fields provided and their default values in case they are not present:

````javascript
var inData = [ 
    { name: "Point 1", x: 1, y: -1 }, 
    { name: "Point 2", x: 5, y: -5 },
    { x: 3 }
]; 
var result = $from(inData).select({ x: 0, y: 0 });
// [ { x: 1, y: -1 },
//   { x: 5, y: -5 },
//   { x: 3, y: 0  } ]
````

### Transform function

The result set will be transformed by the provided function:

````javascript
var inData = [
    { name: "Vector 1", x1: 2, y1: -1, x2: 5, y2: -10 },
    { name: "Vector 2", x1: -2, y1: -1, x2: 5, y2: 10 }
];
var result = $from(inData).select(r => {
    var newResult = { name: r.name };

    newResult.distance = Math.round( Math.sqrt( Math.pow(r.x1-r.x2, 2) + Math.pow(r.y1-r.y2, 2)));

    return newResult;
});
// [ { name: "Vector 1", distance: 9 },
//   { name: "Vector 2", distance: 13} ]
````

### Select into a map of maps

The result set can be transformed into a map of maps by provided an index field:

````javascript
var inData  = [ { a: 1, b: "a1" }, { a: 2, b: "a2" }, { a: 3, b: "a3" } ];
var outData = $from(inData).select(void 0, "b");
// { "a1": {"a":1,"b":"a1"}, "a2": {"a":2,"b":"a2"}, "a3":{"a":3,"b":"a3"} }
````

## QUERY

It's also possible to provide all the query as a map instead of method calls. To do this you can use:

````javascript
var result = $from(anArrayOfData).query(aQueryMap)
````

The query map to provide to the _query_ method is composed of 3 or 4 parts depending on the use:

````javascript
aQueryMap = { where: [], transform: [], select: {} }

// or

aQueryMap = { where: [], transform: [], selector: {} }
````

The following example is provided in YAML with comments to make it easier to visualize:

````yaml
# 1. The where part is composed of an array of conditions and arguments that limit the data
where:
## This is the same as doing .equals("isFile", true)
- cond: equals
  args:
  - isFile
  - true
# 2. The transform part is composed of an array of functions and arguments that transform the data
transform:
## These are the same as doing .attach("lastAccess", elem => new Date(elem.lastAccess)).sort("-size")
- func: attach
  args:
  - lastAccess
  - !!js/eval elem => new Date(elem.lastAccess)
- func: sort
  args:
  - "-size"
# 3. The select part if composed of the same map you would provide to a .select method
## This is equivalent to .select({ filename: "n/a", size: -1 })
select:
  filename: n/a
  size    : -1
# 4. The selector part as an alternative to part 3 allows the use of selector functions
## selector:
### This is equivalent to .at(0)
##  func: at
##  args:
##  - 0
````

> **NOTE:** As you can see each part (with the exception of _select_) is always an array of maps or a single map with a function name (cond/func) followed by an array of the corresponding arguments (args). There are no restrictions on the functions you should use on _where_ or _transform_. The only difference between _where_/_transform_ and _select_/_selector_ is that _select_/_selector_ are functions that cannot be chained and will return a result.

In the end this yaml could be provided as a JSON map to the query method like this:

````javascript
aQueryMap = { where: [ { cond: "equals", args: [ "isFile", true ] } ], transform: [ { func: "attach", args: [ "lastAccess", elem => new Date(elem.lastAccess) }, { func: "sort", args: "-size" ], select: { filename: "n/a", size: -1 } }
````

**Translation:**
Will filter an array of map for the entries where the field _isFile_ is true, will add/replace the field _attach_ converting it into a javascript Date, then sort the resulting array by biggest values on the field _size_ (descending order) and returning an array of maps as a result with two fields: _filename_ and _size_. If _filename_ is not defined for some entry it will be represented as "n/a"; if size is not defined for some entry it will be represented as -1.

Similary using a selector the JSON map to the query method would look like:

````javascript
aQueryMap = { where: [ { cond: "equals", args: [ "isFile", true ] } ], transform: [ { func: "attach", args: [ "lastAccess", elem => new Date(elem.lastAccess) }, { func: "sort", args: "-size" ], selector: { func: "at", args: [ 0 ] } }
````

**Translation:**
Will filter an array of map for the entries where the field _isFile_ is true, will add/replace the field _attach_ converting it into a javascript Date, then sort the resulting array by biggest values on the field _size_ (descending order) and returning only the map, on position 0, of the resulting array of maps.