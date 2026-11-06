// Shared OpenAF/browser regressions. Pass the generated query function and an assertion callback.
exports.testGrouping = function(query, assert) {
    var rows = [{ k: 1, v: 10 }, { k: 1, v: 20 }, { k: 2, v: 30 }, { k: 2, v: 40 }]
    var grouped = query(rows).group("k")
    assert(grouped[1], rows.slice(0, 2), "Numeric groups retain every row")
    assert(grouped[1][0] === rows[0], true, "Grouping retains row identity")
    assert(query(rows).sumBy("k", "v"), [{ k: "1", _sum: 30 }, { k: "2", _sum: 70 }], "Numeric sums retain every row")
    assert(query(rows).countBy("k"), [{ k: "1", _count: 2 }, { k: "2", _count: 2 }], "Numeric counts retain every row")
    assert(query(rows).averageBy("k", "v"), [{ k: "1", _avg: 15 }, { k: "2", _avg: 35 }], "Numeric averages retain every row")
    ;[1, "1", true, false, null, undefined, "__proto__", "constructor", "toString"].forEach(function(key) {
        var members = [{ k: key, sub: 3 }, { k: key, sub: 3 }]
        var result = query(members).group("k")
        assert(Object.prototype.hasOwnProperty.call(result, String(key)), true, "Group is an own property: " + key)
        assert(result[String(key)], members, "Repeated grouping key: " + key)
        var nested = query(members).groupBy("k,sub")
        assert(Object.prototype.hasOwnProperty.call(nested, String(key)), true, "Nested group is an own property: " + key)
        assert(nested[String(key)][3], members, "Nested group retains all rows: " + key)
    })
    assert(query([]).group("k"), {}, "Empty grouping")
    assert(query([1, 1, 2]).group(), { "1": [1, 1], "2": [2] }, "Primitive grouping")

    var shared = { nested: { value: 0 }, items: [{ value: 0 }, undefined, NaN] }
    var snapshots = query(rows).fnBy("k", function(group) {
        shared.nested.value = group[0].v
        shared.items[0].value = group[0].v
        return shared
    }, "stats")
    assert(snapshots.map(function(row) { return row.stats.nested.value }), [10, 30], "Grouped callbacks retain independent snapshots")
    assert(snapshots[0].stats !== snapshots[1].stats && snapshots[0].stats !== shared, true, "Grouped result maps are copied")
    assert(snapshots[0].stats.nested !== snapshots[1].stats.nested && snapshots[0].stats.nested !== shared.nested, true, "Nested result maps are copied")
    assert(snapshots[0].stats.items !== snapshots[1].stats.items && snapshots[0].stats.items !== shared.items, true, "Result arrays are copied")
    assert(snapshots[0].stats.items[0] !== snapshots[1].stats.items[0] && snapshots[0].stats.items[0] !== shared.items[0], true, "Maps within result arrays are copied")
    assert(snapshots[0].stats.items[1] === undefined, true, "Grouped results preserve undefined")
    assert(typeof snapshots[0].stats.items[2] === "number" && isNaN(snapshots[0].stats.items[2]), true, "Grouped results preserve NaN")
    shared.nested.value = 1000
    shared.items[0].value = 1000
    assert(snapshots.map(function(row) { return row.stats.nested.value }), [10, 30], "Caller mutation does not change grouped maps")
    assert(snapshots.map(function(row) { return row.stats.items[0].value }), [10, 30], "Caller mutation does not change grouped arrays")
    snapshots[0].stats.nested.value = 800
    snapshots[0].stats.items[0].value = 800
    assert(snapshots[1].stats.nested.value, 30, "Grouped map snapshots do not alias each other")
    assert(snapshots[1].stats.items[0].value, 30, "Grouped array snapshots do not alias each other")
}

exports.testPagination = function(query, assert) {
    var input = [1, 2, 3, 4, 5, 6]
    ;[[0, 2], [2, 2], [3, 1], [9, 2], [1, -2], [-3, 2], [2, 0]].forEach(function(page) {
        var expected = query(input).skipTake(page[0], page[1]).select()
        assert(query(input).greater(0).skipTake(page[0], page[1]).select(), expected, "An all-pass filter preserves pagination: " + page)
    })
    assert(query(input).greater(2).skipTake(1, 2).select(), [4, 5], "Filter then skip then take")
    assert(query(input).greater(9).skipTake(1, 2).select(), [], "No matches")
    var calls = 0
    var result = query(input).where(function(value) { calls++; return value % 2 === 0 }).skipTake(1, 1).select()
    assert(result, [4], "Callback filter pagination")
    assert(calls, input.length, "Pagination preserves predicate evaluation")
}

exports.testSetOperations = function(query, assert) {
    function sameRows(actual, expected, message) {
        assert(actual.length, expected.length, message + " length")
        actual.forEach(function(value, index) {
            assert(value === expected[index] || (typeof value === "number" && isNaN(value) && typeof expected[index] === "number" && isNaN(expected[index])), true, message + " order/identity " + index)
        })
    }
    var a = { a: 1, b: 2 }, b = { b: 2, a: 1 }, c = { a: 3 }, d = { a: 4 }
    var left = [a, a, c, undefined, null, NaN], right = [b, d, d, null]
    sameRows(query(left).intersect(right).select(), [a, a, null, NaN], "Intersection preserves canonical equality and duplicates")
    sameRows(query(left).except(right).select(), [c, undefined], "Difference preserves order and identity")
    sameRows(query(left).union(right).select(), left.concat([d, d]), "Union keeps duplicate new RHS rows")
    sameRows(query(left).union([]).select(), left, "Empty RHS union")
    sameRows(query([]).intersect(right).select(), [], "Empty intersection")
    sameRows(query(left).except([]).select(), left, "Empty RHS difference")
    var sparse = new Array(1)
    sameRows(query([undefined]).intersect(sparse).select(), [], "Sparse RHS does not contain undefined")
    sameRows(query([undefined]).except(sparse).select(), [undefined], "Sparse RHS preserves explicit undefined")
    var sparseUnion = query(sparse).union([undefined]).select()
    assert(sparseUnion.length, 2, "Sparse union retains hole and explicit undefined")
    assert(Object.keys(sparseUnion), ["1"], "Union preserves sparse ownership")
    var nested = { x: { a: 1, b: 2 } }, reordered = { x: { b: 2, a: 1 } }
    sameRows(query([nested]).intersect([reordered]).select(), [nested], "Nested map keys normalize")
    var arrayMap = { x: [{ a: 1, b: 2 }] }, arrayReordered = { x: [{ b: 2, a: 1 }] }
    sameRows(query([arrayMap]).intersect([arrayReordered]).select(), [], "Nested array serialization retains existing equality")
}
