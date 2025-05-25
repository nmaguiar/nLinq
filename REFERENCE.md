# nLinq Reference

nLinq queries are made through a series of calls divided into three main areas:

```javascript
var result = $from( aSourceArray )      // FROM part
             .equals("aKey1", aValue)   // WHERE part
             .greater("aKey2", 10)      //
             .select()                  // SELECT part
```

Listed below, there are different combinations of WHERE and SELECT functions that you can use.

## FROM

The input should be primarially an array. If a map is provided it will be converted into an array. For streams it can also be a function.

### Simple array
```javascript
var inData  = [ 1, 2, 3 ];
var outData = $from(inData).select();
// [ 1, 2, 3 ]
```

### Array of maps
```javascript
var inData  = [ { a: 1 }, { a: 2 }, { a: 3 } ];
var outData = $from(inData).select();
// [ {a: 1}, {a: 2}, {a: 3} ]
```

### Simple map

```javascript
var inData  = { a: 1, b: 2, c: 3};
var outData = $from(inData).select();
// [ 1, 2, 3 ]
```

### Map of maps

```javascript
var inData  = { a1: { a: 1 }, a2: { a: 2 }, a3: { a: 3 } };
var outData = $from(inData).select();
// [ { a: 1, _key: "a1" }, { a: 2, _key: "a2" }, { a: 3, _key: "a3"} ]
```

You can specify the key name (instead of "_key") by adding an extra parameter:

```javascript
var inData  = { a1: { a: 1 }, a2: { a: 2 }, a3: { a: 3 } };
var outData = $from(inData, "b").select();
// [ { a: 1, b: "a1" }, { a: 2, b: "a2" }, { a: 3, b: "a3"} ]
```

### A function

```javascript
var ll = 0, sum = 0;
var fn = () => ll++;
$from(fn).limit(5).stream(r => sum += r);
// sum = 10 | ll = 6
```

## WHERE

### Logical Query Modifiers

These methods change how subsequent filtering conditions are combined with the preceding conditions.

*   **`and()`**
    *   Description: Sets the logical combiner for the *next* condition to AND. This is the default behavior if no other logical modifier is specified. Subsequent conditions are ANDed with the result of the previous conditions.
    *   Example: ```var data = [ { item: "apple", color: "red" }, { item: "avocado", color: "green" } ]; $from(data).starts("item", "a").and().contains("item", "p").select() // Equivalent to .starts("item", "a").contains("item", "p") ``` _\[{ item: "apple", color: "red" }]_
*   **`or()`**
    *   Description: Sets the logical combiner for the *next* condition to OR with the accumulated result of all previous conditions.
    *   Example: ```var data = [ { item: "apple", fresh: true }, { item: "banana", fresh: false }, { item: "carrot", fresh: true } ]; $from(data).equals("item", "banana").or().equals("fresh", true).select()``` _\[{ item: "apple", fresh: true }, { item: "banana", fresh: false }, { item: "carrot", fresh: true }]_
*   **`not()`**
    *   Description: Negates the result of the *next* condition. By default, it's combined with AND (effectively AND NOT). If explicitly preceded by `or()`, it becomes OR NOT.
    *   Example (AND NOT): ```var data = [ { item: "apple", fresh: true }, { item: "banana", fresh: true } ]; $from(data).equals("fresh", true).not().equals("item", "apple").select()``` _\[{ item: "banana", fresh: true }]_
    *   Example (OR NOT): ```var data = [ { item: "apple", count:10 }, { item: "banana", count:5 }, { item: "carrot", count:10 } ]; $from(data).equals("count", 5).or().not().equals("item", "apple").select()``` _\[ {item:"banana", count:5}, {item:"carrot", count:10} ]_
*   **`andNot()`**
    *   Description: Ensures the next condition is treated as AND NOT. This is a more explicit way of writing `and().not()`.
    *   Example: ```var data = [ { item: "apple", fresh: true }, { item: "banana", fresh: true } ]; $from(data).equals("fresh", true).andNot().equals("item", "apple").select()``` _\[{ item: "banana", fresh: true }]_
*   **`orNot()`**
    *   Description: Ensures the next condition is treated as OR NOT. This is a more explicit way of writing `or().not()`.
    *   Example: ```var data = [ { item: "apple", type:"fruit" }, { item: "banana", type:"fruit" }, {item:"carrot", type:"veg"} ]; $from(data).equals("item", "carrot").orNot().equals("type", "fruit").select()``` _\[{item:"carrot", type:"veg"}]_

### Query Structure Modifiers

These methods control how query conditions are grouped and how some global settings like case sensitivity are applied.

| Method | Description | Example |
|------|-------------|---------|
| useCase | Enables (`true`) or disables (`false`) case-sensitivity for string comparisons. Default is `false` (case-insensitive, as per `nLinq_USE_CASE` global default). If called with no argument, it enables case-sensitivity. | ```var d=["A","a"]; $from(d).useCase(true).equals("a").select()``` _\["a"]_ <br> ```$from(d).useCase(false).equals("a").select()``` _\["A","a"]_ |
| ignoreCase | Disables (`true`) or enables (`false`) case-sensitivity. Inverse of `useCase`. If called with no argument, it disables case-sensitivity (makes it case-insensitive). | ```var d=["A","a"]; $from(d).ignoreCase().equals("a").select()``` _\["A","a"]_ |
| begin | Starts a new logical block `(`. Subsequent conditions are grouped. Default combination with prior conditions is AND. | ```var d=[{t:"F",n:"A"},{t:"F",n:"B"}]; $from(d).equals("t","F").begin().equals("n","A").or().equals("n","B").end().select()``` _(Selects items where t="F" AND (n="A" OR n="B"))_ |
| orBegin | Starts a new logical block with `|| (`. The entire block is ORed with previous conditions. | ```var d=[{c:"X",n:"A"},{t:"F",n:"G"}]; $from(d).equals("c","X").orBegin().equals("t","F").equals("n","G").end().select()``` _(Selects items where c="X" OR (t="F" AND n="G"))_ |
| andBegin | Starts a new logical block with `&& (`. This is generally the default behavior for `begin()` if not preceded by `or()`. | ```var d=[{t:"F",n:"A"},{t:"V",n:"C"}]; $from(d).equals("t","F").andBegin().equals("n","A").end().select()``` _(Selects items where t="F" AND n="A")_ |
| end | Ends the current logical block `)`. | ```var d=[{t:"F",n:"A"}]; $from(d).begin().equals("t","F").end().select()``` _\[{t:"F",n:"A"}]_ |

### Restriciting prefixes and suffixes

Consider the following example:

```javascript
var names = [
  { first: "James", last: "Bond" },
  { first: "James", last: "Scott" },
  { first: "Louis", last: "Bond" }
];
```

| Method | Description | Example |
|------|-------------|---------|
| starts | Restricts string fields prefix to a value | ```$from(names).starts("first", "J").select()``` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"}]_ |
| andStarts | Restricts string fields prefix to a value in addition to the previous restriction | ```$from(names).starts("first", "J").starts("last", "B").select()``` _[{"first":"James","last":"Bond"}]_ |
| notStarts | Restricts string fields that are not prefixed by a value | ```$from(names).notStarts("first", "J").select()``` _[{"first":"Louis","last":"Bond"}]_ |
| andNotStarts | Restricts string fields that are not prefixed by a value in addition to the previous restriction | ```$from(names).starts("first", "J").andNotStarts("last", "S").select()``` _[{"first":"James","last":"Bond"}]_ |
| orStarts | Restricts string fields prefix to a value in alternative to the previous restriction | ```$from(names).starts("first", "Ja").orStarts("last", "Bo").select()``` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"},{"first":"Louis","last":"Bond"}]_ |
| orNotStarts | Restricts string fields prefix that are not prefixed by a value in alternative to the previous restriction | ```$from(names).starts("first", "Ja").orNotStarts("last", "Sc").select()``` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"},{"first":"Louis","last":"Bond"}]_ |
| ends | Restricts string fields suffix to a value | ```$from(names).ends("last", "nd").select()``` _[{"first":"James","last":"Bond"},{"first":"Louis","last":"Bond"}]_ |
| andEnds | Restricts string fields suffix to a value in addition to the previous restriction | ```$from(names).ends("first", "es").andEnds("last", "d").select()``` _[{"first":"James","last":"Bond"}]_ |
| notEnds | Restricts string fields that are not suffixed by a value | ```$from(names).notEnds("last", "Bond").select()``` _[{"first":"James","last":"Scott"}]_ |
| andNotEnds | Restricts string fields that are not suffixed by a value in addition to a previous restriction | ```$from(names).starts("first", "J").andNotEnds("last", "d").select()``` _[{"first":"James","last":"Scott"}]_ |
| orEnds | Restricts string fields that are suffixed by a value in alternative to a previous restriction | ```$from(names).starts("first", "J").orEnds("first", "d").select()``` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"}]_ |
| orNotEnds | Restricts string fields that are not suffixed by a value in alternative to a previous restriction | ```$from(names).starts("first", "J").orNotEnds("first", "s").select()``` _[{"first":"James","last":"Bond"},{"first":"James","last":"Scott"}]_ |
### Restricting by equality

| Method | Description | Example |
|------|-------------|---------|
| andEquals | Restricts by a specific value of a field | ```$from(names).equals("firstName", "Scoot").andEquals("lastName", "Tiger").select()``` |
| greaterEquals | Restricts by a field value greater than or equal to a specific value | ```$from(names).greaterEquals("age", 30).select()``` |
| andGreaterEquals | Restricts by multiple field values greater than or equal to specific values | ```$from(names).greaterEquals("age", 30).andGreaterEquals("salary", 50000).select()``` |
| notGreaterEquals | Restricts by a field value not greater than or equal to a specific value | ```$from(names).notGreaterEquals("age", 30).select()``` |
| andNotGreaterEquals | Restricts by multiple field values not greater than or equal to specific values | ```$from(names).notGreaterEquals("age", 30).andNotGreaterEquals("salary", 50000).select()``` |
| orGreaterEquals | Restricts by either of the field values being greater than or equal to specific values | ```$from(names).greaterEquals("age", 30).orGreaterEquals("salary", 50000).select()``` |
| orNotGreaterEquals | Restricts by either of the field values not being greater than or equal to specific values | ```$from(names).notGreaterEquals("age", 30).orNotGreaterEquals("salary", 50000).select()``` |
| lessEquals | Restricts by a field value less than or equal to a specific value | ```$from(names).lessEquals("age", 30).select()``` |
| andLessEquals | Restricts by multiple field values less than or equal to specific values | ```$from(names).lessEquals("age", 30).andLessEquals("salary", 50000).select()``` |
| andNotLessEquals | Restricts by multiple field values not less than or equal to specific values | ```$from(names).notLessEquals("age", 30).andNotLessEquals("salary", 50000).select()``` |
| orLessEquals | Restricts by either of the field values being less than or equal to specific values | ```$from(names).lessEquals("age", 30).orLessEquals("salary", 50000).select()``` |
| orNotLessEquals | Restricts by either of the field values not being less than or equal to specific values | ```$from(names).notLessEquals("age", 30).orNotLessEquals("salary", 50000).select()``` |

### Restricting by value

| Method | Description | Example |
|------|-------------|---------|
| greater | Restricts by a field value greater than a specific value | ```$from(names).greater("age", 30).select()``` |
| andGreater | Restricts by multiple field values greater than specific values | ```$from(names).greater("age", 30).andGreater("salary", 50000).select()``` |
| notGreater | Restricts by a field value not greater than a specific value | ```$from(names).notGreater("age", 30).select()``` |
| andNotGreater | Restricts by multiple field values not greater than specific values | ```$from(names).notGreater("age", 30).andNotGreater("salary", 50000).select()``` |
| orGreater | Restricts by either of the field values being greater than specific values | ```$from(names).greater("age", 30).orGreater("salary", 50000).select()``` |
| orNotGreater | Restricts by either of the field values not being greater than specific values | ```$from(names).notGreater("age", 30).orNotGreater("salary", 50000).select()``` |
| less | Restricts by a field value less than a specific value | ```$from(names).less("age", 30).select()``` |
| andLess | Restricts by multiple field values less than specific values | ```$from(names).less("age", 30).andLess("salary", 50000).select()``` |
| notLess | Restricts by a field value not less than a specific value | ```$from(names).notLess("age", 30).select()``` |
| andNotLess | Restricts by multiple field values not less than specific values | ```$from(names).notLess("age", 30).andNotLess("salary", 50000).select()``` |
| orLess | Restricts by either of the field values being less than specific values | ```$from(names).less("age", 30).orLess("salary", 50000).select()``` |
| orNotLess | Restricts by either of the field values not being less than specific values | ```$from(names).notLess("age", 30).orNotLess("salary", 50000).select()``` |
| between | Restricts by a field value between two specific values | ```$from(names).between("age", 20, 30).select()``` |
| andBetween | Restricts by multiple field values between specific values | ```$from(names).between("age", 20, 30).andBetween("salary", 40000, 60000).select()``` |
| andNotBetween | Restricts by multiple field values not between specific values | ```$from(names).notBetween("age", 20, 30).andNotBetween("salary", 40000, 60000).select()``` |
| orBetween | Restricts by either of the field values being between specific values | ```$from(names).between("age", 20, 30).orBetween("salary", 40000, 60000).select()``` |
| orNotBetween | Restricts by either of the field values not being between specific values | ```$from(names).notBetween("age", 20, 30).orNotBetween("salary", 40000, 60000).select()``` |
| betweenEquals | Restricts by a field value between or equal to two specific values | ```$from(names).betweenEquals("age", 20, 30).select()``` |
| andBetweenEquals | Restricts by multiple field values between or equal to specific values | ```$from(names).betweenEquals("age", 20, 30).andBetweenEquals("salary", 40000, 60000).select()``` |
| andNotBetweenEquals | Restricts by multiple field values not between or equal to specific values | ```$from(names).notBetweenEquals("age", 20, 30).andNotBetweenEquals("salary", 40000, 60000).select()``` |
| orBetweenEquals | Restricts by either of the field values being between or equal to specific values | ```$from(names).betweenEquals("age", 20, 30).orBetweenEquals("salary", 40000, 60000).select()``` |
| orNotBetweenEquals | Restricts by either of the field values not being between or equal to specific values | ```$from(names).notBetweenEquals("age", 20, 30).orNotBetweenEquals("salary", 40000, 60000).select()``` |

### Restricting by value matching

| Method | Description | Example |
|------|-------------|---------|
| contains | Restricts to items where the string representation of the field `aKey` contains the substring `aValue`. Case-insensitive by default. | ```var data = [ {name: "apple"}, {name: "banana"} ]; $from(data).contains("name", "ppl").select()``` _\[{name:"apple"}]_ |
| andContains | Adds an additional restriction: items where the string representation of the field `aKey` contains the substring `aValue`. Case-insensitive by default. | ```var data = [ {name: "apple", type: "fruit"}, {name: "apricot", type: "fruit"} ]; $from(data).contains("type", "fruit").andContains("name", "ric").select()``` _\[{name:"apricot", type:"fruit"}]_ |
| andNotContains | Adds an additional restriction: items where the string representation of the field `aKey` does NOT contain the substring `aValue`. Case-insensitive by default. | ```var data = [ {name: "apple", type: "fruit"}, {name: "banana", type: "fruit"} ]; $from(data).contains("type", "fruit").andNotContains("name", "nan").select()``` _\[{name:"apple", type:"fruit"}]_ |
| orContains | Alternative restriction: items where the string representation of the field `aKey` contains the substring `aValue`. Case-insensitive by default. | ```var data = [ {name: "apple"}, {name: "banana"}, {name: "carrot"} ]; $from(data).contains("name", "apple").orContains("name", "carrot").select()``` _\[{name:"apple"}, {name:"carrot"}]_ |
| orNotContains | Alternative restriction: items where the string representation of the field `aKey` does NOT contain the substring `aValue`. Case-insensitive by default. | ```var data = [ {name: "apple", type: "fruit"}, {name: "banana", type: "fruit"}, {name: "carrot", type: "veg"} ]; $from(data).equals("name", "apple").orNotContains("type", "fruit").select()``` _\[{name:"apple", type:"fruit"}, {name:"carrot", type:"veg"}]_ |
| empty | Restricts to items where the field `aKey` is undefined, null, or its string representation is empty. | ```var data = [ {name: "apple", tags: ["red"]}, {name: "banana", tags: []}, {name: "carrot"} ]; $from(data).empty("tags").select()``` _\[{name:"banana", tags:\[]}, {name:"carrot"}]_ |
| andEmpty | Adds an additional restriction: items where the field `aKey` is undefined, null, or its string representation is empty. | ```var data = [ {type: "fruit", name: "apple"}, {type: "veg", name: ""}, {type: "fruit"} ]; $from(data).equals("type", "veg").andEmpty("name").select()``` _\[{type:"veg", name:""}]_ |
| andNotEmpty | Adds an additional restriction: items where the field `aKey` is defined and its string representation is NOT empty. | ```var data = [ {type: "fruit", name: "apple"}, {type: "veg", name: ""}, {type: "fruit"} ]; $from(data).equals("type", "fruit").andNotEmpty("name").select()``` _\[{type:"fruit", name:"apple"}]_ |
| orEmpty | Alternative restriction: items where the field `aKey` is undefined, null, or its string representation is empty. | ```var data = [ {name: "apple", cat:"A"}, {name: "banana", cat:""}, {name: "carrot", cat:"A"} ]; $from(data).equals("name", "apple").orEmpty("cat").select()``` _\[{name:"apple", cat:"A"}, {name:"banana", cat:""}]_ |
| orNotEmpty | Alternative restriction: items where the field `aKey` is defined and its string representation is NOT empty. | ```var data = [ {name: "apple", cat:"A"}, {name: "banana", cat:""}, {name: "carrot"} ]; $from(data).empty("cat").orNotEmpty("name").select()``` _\[{name:"apple", cat:"A"}, {name:"banana", cat:""}, {name:"carrot"}]_ |
| match | Restricts to items where the string representation of field `aKey` matches the regular expression `aRegex`. Case-insensitive by default. | ```var data = [ {name: "apple"}, {name: "apricot"} ]; $from(data).match("name", /^ap/i).select()``` _\[{name:"apple"}, {name:"apricot"}]_ |
| andMatch | Adds an additional restriction: items where the string representation of field `aKey` matches `aRegex`. Case-insensitive by default. | ```var data = [ {name: "apple", type: "fruit"}, {name: "orange", type: "fruit"} ]; $from(data).equals("type", "fruit").andMatch("name", /e$/i).select()``` _\[{name:"apple", type:"fruit"}, {name:"orange", type:"fruit"}]_ |
| andNotMatch | Adds an additional restriction: items where the string representation of field `aKey` does NOT match `aRegex`. Case-insensitive by default. | ```var data = [ {name: "apple", type: "fruit"}, {name: "banana", type: "fruit"} ]; $from(data).equals("type", "fruit").andNotMatch("name", /^a/i).select()``` _\[{name:"banana", type:"fruit"}]_ |
| orMatch | Alternative restriction: items where the string representation of field `aKey` matches `aRegex`. Case-insensitive by default. | ```var data = [ {name: "apple"}, {name: "banana"}, {name: "apricot"} ]; $from(data).match("name", /^a/).orMatch("name", /^b/).select()``` _\[{name:"apple"}, {name:"banana"}, {name:"apricot"}]_ |
| orNotMatch | Alternative restriction: items where the string representation of field `aKey` does NOT match `aRegex`. Case-insensitive by default. | ```var data = [ {name: "apple", type: "fruit"}, {name: "carrot", type: "veg"} ]; $from(data).equals("name", "apple").orNotMatch("type", /fruit/i).select()``` _\[{name:"apple", type:"fruit"}, {name:"carrot", type:"veg"}]_ |

### Restricting by value type

| Method | Description | Example |
|------|-------------|---------|
| type | Restricts to items where the JavaScript `typeof` the field `aKey` is equal to the string `aValue`. | ```var data = [ { item: "apple", count: 10 }, { item: "banana", count: "N/A" } ]; $from(data).type("count", "number").select()``` _\[{ item: "apple", count: 10 }]_ |
| andType | Adds an additional restriction: items where `typeof` field `aKey` is `aValue`. | ```var data = [ { item: "apple", count: 10, fresh: true }, { item: "banana", count: "N/A", fresh: true } ]; $from(data).equals("fresh", true).andType("count", "string").select()``` _\[{ item: "banana", count: "N/A", fresh: true }]_ |
| andNotType | Adds an additional restriction: items where `typeof` field `aKey` is NOT `aValue`. | ```var data = [ { item: "apple", count: 10, fresh: true }, { item: "banana", count: "N/A", fresh: true } ]; $from(data).equals("fresh", true).andNotType("count", "string").select()``` _\[{ item: "apple", count: 10, fresh: true }]_ |
| orType | Alternative restriction: items where `typeof` field `aKey` is `aValue`. | ```var data = [ { item: "apple", count: 10 }, { item: "banana", price: 0.5 } ]; $from(data).type("count", "string").orType("price", "number").select()``` _\[{ item: "banana", price: 0.5 }]_ |
| orNotType | Alternative restriction: items where `typeof` field `aKey` is NOT `aValue`. | ```var data = [ { item: "apple", count: 10 }, { item: "banana", price: "cheap" } ]; $from(data).type("count", "string").orNotType("price", "string").select()``` _\[{ item: "apple", count: 10 }]_ |
| is | Restricts to items where the field `aKey` exists and is truthy (not null, undefined, false, 0, or empty string). | ```var data = [ { item: "apple", notes: "A round fruit" }, { item: "banana", notes: null }, { item: "carrot", notes: "" } ]; $from(data).is("notes").select()``` _\[{ item: "apple", notes: "A round fruit" }]_ |
| andIs | Adds an additional restriction: items where field `aKey` is truthy. | ```var data = [ { item: "apple", fresh: true, notes: "Good" }, { item: "banana", fresh: true, notes: "" } ]; $from(data).equals("fresh", true).andIs("notes").select()``` _\[{ item: "apple", fresh: true, notes: "Good" }]_ |
| andNotIs | Adds an additional restriction: items where field `aKey` is falsy (null, undefined, false, 0, or empty string). | ```var data = [ { item: "apple", fresh: true, notes: "Good" }, { item: "banana", fresh: true, notes: "" } ]; $from(data).equals("fresh", true).andNotIs("notes").select()``` _\[{ item: "banana", fresh: true, notes: "" }]_ |
| orIs | Alternative restriction: items where field `aKey` is truthy. | ```var data = [ { item: "apple", main:true, notes: "" }, { item: "banana", main:false, notes: "Sweet" } ]; $from(data).is("notes").orIs("main").select()``` _\[{ item: "apple", main:true, notes: "" }, { item: "banana", main:false, notes: "Sweet" }]_ |
| orNotIs | Alternative restriction: items where field `aKey` is falsy. | ```var data = [ { item: "apple", code: "A", desc: null }, { item: "banana", code: "B", desc: "Fruit" } ]; $from(data).equals("code", "B").orNotIs("desc").select()``` _\[{ item: "apple", code: "A", desc: null }, { item: "banana", code: "B", desc: "Fruit" }]_ |

### Changing the current result set

These methods operate on the current result set, often modifying it or preparing it for final selection. They typically return the `nLinq` object for chaining, unless specified otherwise.

| Method | Description | Example |
|------|-------------|---------|
| each | Executes a function `aFn` for each element in the current result set. Primarily for side-effects. | ```var logs = []; var users = [{name:"A"}, {name:"B"}]; $from(users).each(u => logs.push(u.name + " processed")).select(); /* logs = ["A processed", "B processed"] */ ``` |
| intersect | Modifies the current set to include only elements also present in `aArrayB`. | ```var arrayA = [1,2,3,4], arrayB = [3,4,5,6]; $from(arrayA).intersect(arrayB).select()``` _\[3,4]_ |
| except | Modifies the current set to exclude elements present in `aArrayB`. | ```var arrayA = [1,2,3,4], arrayB = [3,4,5,6]; $from(arrayA).except(arrayB).select()``` _\[1,2]_ |
| union | Modifies the current set to include unique elements from both the current set and `aArrayB`. | ```var arrayA = [1,2,3,4], arrayB = [3,4,5,6]; $from(arrayA).union(arrayB).select()``` _\[1,2,3,4,5,6]_ |
| cartesian | Creates a Cartesian product with `aArrayB`. Objects are merged; primitives are paired. | ```$from([{a:1}]).cartesian([{b:2}]).select()``` _\[{a:1,b:2}]_ <br> ```$from([1]).cartesian(["a"]).select()``` _\[[1,"a"]]_ |
| attach | Adds/modifies field `aKey` on each element. `aValueOrFn` is a static value or a function `r => ...`. | ```var users = [{n:"A"}]; $from(users).attach("status", "active").select()``` <br> ```$from(users).attach("info", r => r.n + " info").select()``` |
| attachBy | Attach a new key `aNewKey` with value `aClass` if `element[aKey]` equals `aValue`. | ```var d = [{iF:true}]; $from(d).attachBy("ord", "iF", true, 1).select()``` _\[{iF:true, ord:1}]_ |
| attachNotBy | Attach `aNewKey` with `aClass` if `element[aKey]` does NOT equal `aValue`. | ```var d = [{iF:false}]; $from(d).attachNotBy("ord", "iF", true, 1).select()``` _\[{iF:false, ord:1}]_ |
| attachByEmpty | Attach `aClass` to `aNewKey` if `element[aNewKey]` is null or undefined. | ```var d = [{n:null}]; $from(d).attachByEmpty("n", "empty").select()``` _\[{n:"empty"}]_ |
| detach | Removes field `aKey` from each element. | ```var users = [{name:"A", city:"NY"}]; $from(users).detach("city").select()``` _\[{name:"A"}]_ |
| toDate | Converts field `aKey` in each element to a JavaScript `Date` object. | ```var d = [{j:"2020-01-01"}]; $from(d).toDate("j").select()``` _(j becomes Date object)_ |
| filter | Filters set using a map for partial match or a function `r => boolean`. | ```var u=[{c:"NY"},{c:"LN"}]; $from(u).filter({c:"NY"}).select()``` <br> ```$from(u).filter(r=>r.c=="LN").select()``` |
| sort | Sorts the set by one or more keys (e.g., "age", "-name" for descending). | ```var u=[{a:30},{a:20}]; $from(u).sort("-age").select()``` _\[{a:30},{a:20}]_ |
| assign | Assigns first matching element from `aSource` to `aAlias` based on `aPK` (current) == `aFK` (source). Uses `aFallback` if no match. | ```var c=[{i:1}]; var o=[{uI:1,t:"B"}]; $from(c).assign(o,"o","i","uI",0).select()``` _\[{i:1,o:{uI:1,t:"B"}}]_) |
| join | Assigns all matching elements from `aSource` (as an array) to `aAlias` based on `aPK` == `aFK`. | ```var c=[{i:1}]; var o=[{uI:1,t:"B"}]; $from(c).join(o,"o","i","uI").select()``` _\[{i:1,o:\[{uI:1,t:"B"}]}]_ |
| skip | Skips the first `aSkipCount` elements. | ```var i=[1,2,3,4]; $from(i).skip(2).select()``` _\[3,4]_ |
| skipWhile | Skips elements while `aSkipFn(element)` is true. | ```var i=[1,2,3,4]; $from(i).skipWhile(x => x < 3).select()``` _\[3,4]_ |
| takeWhile | Takes elements while `aTakeFn(element)` is true. | ```var i=[1,2,3,4]; $from(i).takeWhile(x => x < 3).select()``` _\[1,2]_ |
| take | Takes the first `aNum` elements from current set. Similar to `limit()`. | ```var i=[1,2,3,4]; $from(i).skip(1).take(2).select()``` _\[2,3]_ |
| skipTake | Skips `aSkipCount` then takes `aTakeCount` elements. | ```var i=[1,2,3,4,5]; $from(i).skipTake(1,2).select()``` _\[2,3]_ |
| define | Replaces current result set with `select(aParam)` output, then continues chaining. | ```var u=[{n:"A",c:"NY"}]; $from(u).define({n:1}).select()``` _\[{n:"A"}]_ |
| removed | Inverts filter logic for `select(aParam)`, keeping non-matching items. | ```var u=[{c:"NY"},{c:"LN"}]; $from(u).removed({c:"NY"}).select()``` _\[{c:"LN"}]_ |
| stream | Processes elements in a streaming fashion, often for function inputs. `aParam` is the item processing function. | ```var c=0,m=3,g=()=>c<m?c++:void 0,s=0; $from(g).stream(r=>s+=r); /* s=3 (0+1+2) */``` |
| streamFn | Returns a function that, when called, processes the next element/batch using `aParam` logic. | ```var c=0,g=()=>c<2?c++:void 0; var n=$from(g); var fN=n.streamFn(r=>r*2); fN(); fN();``` _(Calls yield 0, then 2)_ |

## SELECT

| Method | Description | Example |
|------|-------------|---------|
| select | Returns all fields from the original array | ```$from(anArray).select()``` |
| select (selected fields) | Returns specific fields with corresponding default values | ```$from(anArray).select({ f1: "n/a", f2: false })```
| select (transform function) | Returns the result of the transformation function | ```$from(anArray).select(r => ({ f1: r.f1, f2: r.a1 + r.a2 }))``` |
| min | Returns the minimum value of a field from the result | ```$from(anArrayOfTemperatures).min("temperature")``` |
| max | Returns the maximum value of a field from the result | ```$from(anArrayOfTemperatures).max("temperature")``` |
| average | Returns the average value of a field from the result | ```$from(anArrayOfTemperatures).average("temperature")``` |
| sum | Returns the sum value of a field from the result | ```$from(anArrayOfFiles).sum("size")``` |
| distinct | Returns an array of distinct values for a specific field from the result | ```$from(anArrayOfMeasures).distinct("measureName")``` |
| group | Returns a map grouping the array of records by a specific field from the result. | ```var p=[{c:"F",n:"A"}]; $from(p).group("c").select()``` _Output: {F:\[{c:"F",n:"A"}]}_ |
| groupBy | Groups records by one or more comma-separated keys. Returns a nested object structure. | ```var p=[{c:"F",s:"X",n:"A"}]; $from(p).groupBy("c,s").select()``` _Output: {F:{X:\[{c:"F",s:"X",n:"A"}]}}_ |
| fnBy | Generic aggregation: groups by `aKey`, applies `aFn` to each group, stores result in `aFnKey` (default: `_result`), group key(s) in `aAltKey`(s). | ```var p=[{c:"F",q:2},{c:"F",q:3}]; $from(p).fnBy("c",g=>g.length,"cnt").select()``` _\[{c:"F",cnt:2}]_ |
| minBy | Groups by `aKey`, finds min of `aField` in each group, stores in `aFnKey` (default: `_min`). | ```var p=[{c:"F",v:1},{c:"F",v:2}]; $from(p).minBy("c","v").select()``` _\[{c:"F",_min:1}]_ |
| maxBy | Groups by `aKey`, finds max of `aField` in each group, stores in `aFnKey` (default: `_max`). | ```var p=[{c:"F",v:1},{c:"F",v:2}]; $from(p).maxBy("c","v").select()``` _\[{c:"F",_max:2}]_ |
| averageBy | Groups by `aKey`, calculates average of `aField` in each group, stores in `aFnKey` (default: `_avg`). | ```var p=[{c:"F",v:1},{c:"F",v:3}]; $from(p).averageBy("c","v").select()``` _\[{c:"F",_avg:2}]_ |
| sumBy | Groups by `aKey`, calculates sum of `aField` in each group, stores in `aFnKey` (default: `_sum`). | ```var p=[{c:"F",v:1},{c:"F",v:3}]; $from(p).sumBy("c","v").select()``` _\[{c:"F",_sum:4}]_ |
| mselect | Selects fields (like `select(aParam)`) then transforms array to a map, using `aKey` field's values as keys. `dontRemove` (default true) keeps `aKey` in items. | ```var d=[{i:"a",v:1}]; $from(d).mselect(null,"i").select()``` _Output: {a:{i:"a",v:1}}_ |
| at | Returns a single entry of the result set. | ```$from(anArray).at(23)``` |
| all | Returns true if all records from the original array are present on the final result set (false otherwise). | ```$from(anArray).all()``` |
| count | Returns the number of records of the final result set | ```$from(anArray).count()``` |
| countBy | Returns an array counting records per each value after grouping the array of records by a specific field from the result | ```$from(anArray).countBy("groupByFieldName1,groupByFieldName2", "countRecordsFieldName", "keyFieldNameToUseOnResult1,keyFieldNameToUseOnResult2")``` |
| first | Returns the first record of the final result set | ```$from(anArray).first()``` |
| last | Returns the last record of the final result set | ```$from(anArray).last()``` |
| any | Returns true if the result set has any record at all (false otherwise) | ```$from(anArray).any()``` |
| none | Returns true if the result set is empty (false otherwise) | ```$from(anArray).none()``` |
| reverse | Returns a reverse order result set | ```$from(anArray).reverse()``` |
| limit | Returns just a limited amount of records. Applied *before* final selection projection. | ```$from(anArray).limit(5)``` |
| head | Returns a limited amount of the first records. Applied *before* final selection projection. | ```$from(anArray).head(10)``` |
| tail | Returns a limited amount of the last records. Applied *before* final selection projection. (May load full dataset). | ```$from(anArray).tail(10)``` |


### Simple select

Return the current result set with the WHERE part applied:

```javascript
var result = $from([ 1, 2, 3 ]).select();
// [ 1, 2, 3 ]
```

### Select the fields

Return the current result set with the WHERE part restricting each map entry on the result to the fields provided and their default values in case they are not present:

```javascript
var inData = [ 
    { name: "Point 1", x: 1, y: -1 }, 
    { name: "Point 2", x: 5, y: -5 },
    { x: 3 }
]; 
var result = $from(inData).select({ x: 0, y: 0 });
// [ { x: 1, y: -1 },
//   { x: 5, y: -5 },
//   { x: 3, y: 0  } ]
```

### Transform function

The result set will be transformed by the provided function:

```javascript
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
```

### Select into a map of maps

The result set can be transformed into a map of maps by provided an index field:

```javascript
var inData  = [ { a: 1, b: "a1" }, { a: 2, b: "a2" }, { a: 3, b: "a3" } ];
var outData = $from(inData).select(void 0, "b");
// { "a1": {"a":1,"b":"a1"}, "a2": {"a":2,"b":"a2"}, "a3":{"a":3,"b":"a3"} }
```

## QUERY

It's also possible to provide all the query as a map instead of method calls. To do this you can use:

```javascript
var result = $from(anArrayOfData).query(aQueryMap)
```

The query map to provide to the _query_ method is composed of 3 or 4 parts depending on the use:

```javascript
aQueryMap = { where: [], transform: [], select: {} }

// or

aQueryMap = { where: [], transform: [], selector: {} }
```

The following example is provided in YAML with comments to make it easier to visualize:

```yaml
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
```

> **NOTE:** As you can see each part (with the exception of _select_) is always an array of maps or a single map with a function name (cond/func) followed by an array of the corresponding arguments (args). There are no restrictions on the functions you should use on _where_ or _transform_. The only difference between _where_/_transform_ and _select_/_selector_ is that _select_/_selector_ are functions that cannot be chained and will return a result.

In the end this yaml could be provided as a JSON map to the query method like this:

```javascript
aQueryMap = { where: [ { cond: "equals", args: [ "isFile", true ] } ], transform: [ { func: "attach", args: [ "lastAccess", elem => new Date(elem.lastAccess) }, { func: "sort", args: "-size" ], select: { filename: "n/a", size: -1 } }
```

**Translation:**
Will filter an array of map for the entries where the field _isFile_ is true, will add/replace the field _attach_ converting it into a javascript Date, then sort the resulting array by biggest values on the field _size_ (descending order) and returning an array of maps as a result with two fields: _filename_ and _size_. If _filename_ is not defined for some entry it will be represented as "n/a"; if size is not defined for some entry it will be represented as -1.

Similary using a selector the JSON map to the query method would look like:

```javascript
aQueryMap = { where: [ { cond: "equals", args: [ "isFile", true ] } ], transform: [ { func: "attach", args: [ "lastAccess", elem => new Date(elem.lastAccess) }, { func: "sort", args: "-size" ], selector: { func: "at", args: [ 0 ] } }
```

**Translation:**
Will filter an array of map for the entries where the field _isFile_ is true, will add/replace the field _attach_ converting it into a javascript Date, then sort the resulting array by biggest values on the field _size_ (descending order) and returning only the map, on position 0, of the resulting array of maps.