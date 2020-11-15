/* Author: Nuno Aguiar */

loadLib("nfrom.js");

ow.loadTest();

// SELECTOR tests

ow.test.test("Simple result", () => {
    var ar = io.listFiles(".").files;

    var res = _from(ar).select();
    ow.test.assert(ar.length, res.length, "Problem with the simple result test.");
});

ow.test.test("Simple result function", () => {
    var ar = io.listFiles(".").files;

    var res = _from(ar).select(r => r);
    ow.test.assert(ar.length, res.length, "Problem with the simple function test.");
});

ow.test.test("Simple result function transform", () => {
    var ar = io.listFiles(".").files;

    var res = _from(ar).select(r => {
        if (r.isFile) return 1; else return 0;
    });
    ow.test.assert(ar.length, res.length, "Problem with the simple function transform test.");
});

ow.test.test("Simple result map", () => {
    var ar = io.listFiles(".").files;

    var res = _from(ar).select({ isFile: false });
    ow.test.assert(Object.keys(res[0]).length, 1, "Problem with the simple map test test.");
});

ow.test.test("Simple array min", () => {
    var ar = [1, 2, 3];

    var res = _from(ar).min();
    ow.test.assert(res, 1, "Problem with simple array min.");
});

ow.test.test("Simple array max", () => {
    var ar = [1, 2, 3];

    var res = _from(ar).max();
    ow.test.assert(res, 3, "Problem with simple array max.");
});

ow.test.test("Simple array sum", () => {
    var ar = [1, 2, 3];

    var res = _from(ar).sum();
    ow.test.assert(res, 6, "Problem with simple array sum.");
});

ow.test.test("Simple array average", () => {
    var ar = [1, 2, 3];

    var res = _from(ar).average();
    ow.test.assert(res, 2, "Problem with simple array average.");
});

ow.test.test("Simple at selector", () => {
    var ar = [1, 2, 3];

    ow.test.assert(_from(ar).at(0), 1, "Problema with simple at selector (1)");
    ow.test.assert(_from(ar).at(1), 2, "Problema with simple at selector (2)");
    ow.test.assert(_from(ar).at(2), 3, "Problema with simple at selector (3)");
});

ow.test.test("Simple count selector", () => {
    var ar = [1, 2, 3];

    ow.test.assert(_from(ar).count(), 3, "Problema with simple count selector");
});

ow.test.test("Simple reverse selector", () => {
    var ar = [1, 2, 3];

    ow.test.assert(_from(ar).reverse()[0], 3, "Problema with simple reverse selector");
});