// nlinq.js
//

/* Author: Nuno Aguiar */

var nLinq = function(anObject) {
    // Verify input
    if ($$(anObject).isMap()) {
        anObject = Object.values(anObject);
    }

    _$(anObject).isArray().$_();
    var res = anObject, where = "", useCase = false, useOr = false, useNot = false;

    // Auxiliary functions

    // Auxiliary functions - apply query conditions
    var applyConditions = aOrig => {
        if ($$(aOrig).isFunction()) aOrig = aOrig();

        if (where.length == 0) return aOrig;

        where = where.replace(/\;/g, " ");
        var f = new Function("r", "return (" + where + ")");
        res = aOrig.filter(r => f(r));
        return res;
    };

    // Auxiliary functions - verify the provided key
    var vKey = aKey => {
        if ($$(aKey).isString() && aKey.replace(/^[^a-zA-Z_$]|[^\w$]/g, "") == aKey) {
            return (useCase ? aKey.toLowerCase() : aKey);
        } else {
            if ($$(aKey).isDef()) throw "'" + aKey + "' is not valid key."; else return void 0;
        }
    };

    // Auxiliary functions - verify the provided value
    var vValue = aValue => {
        if (!($$(aValue).isNumber() || $$(aValue).isBoolean())) { 
            aValue = JSON.stringify(aValue, void 0, "");
            aValue = (useCase ? aValue.toLowerCase() : aValue); 
        }
        return aValue;
    };

    // Auxiliary functions - given a key, a value, a query template app change the current query
    var applyWhere = (aKey, aValue, aTmpl, isOr, isTwoValues, aValue2) => {
        var isM;
        if (isTwoValues) {
            isM = $$(aValue2).isDef();
            var origValue = aValue;
            aValue  = vValue(isM ? aValue : aKey);
            aValue2 = vValue(isM ? aValue2 : origValue);
        } else {
            isM = $$(aValue).isDef();
            aValue = vValue(isM ? aValue : aKey);
            aKey   = isM ? vKey(aKey) : void 0;
        }

        if (isM) aTmpl = aTmpl.replace(/{k}/g, "r." + aKey); else aTmpl = aTmpl.replace(/{k}/g, "r");
        if ($$(aValue2).isDef()) {
            aValue2 = vValue(aValue2);
            aTmpl = aTmpl.replace(/{v}/g, aValue).replace(/{v2}/g, aValue2);
        } else {
            aTmpl = aTmpl.replace(/{v}/g, aValue);
        }
        applyWhereTmpl(aTmpl, isOr);
    };

    // Auxiliary functions - append a sub-query to the current query 
    var applyWhereTmpl = (aTmpl, isOr) => {
        isOr = _$(isOr).default(useOr);

        if (where.length > 0) {
            if (!isOr) {
                where += " && ";
            } else {
                where = "(" + where + ") || ";
            }
        }
        where += "(" + aTmpl + ")";
    };

    // Main code
    var code = {
        // Change default behaviour
        useCase      : aTmpl => { useCase = ($$(aTmpl).isUnDef() || aTmpl ? true : false); return code; },
        ignoreCase   : aTmpl => { useCase = ($$(aTmpl).isUnDef() || aTmpl ? false : true); return code; },
        // TODO: Support remembering the previous key if none provided
        or           : () => { useOr = true; return code; },
        and          : () => { useOr = false; return code; },
        not          : () => { useNot = true; return code; },
        andNot       : () => { useOr = false; useNot = true; return code; },
        orNot        : () => { useOr = true; useNot = true; return code; },

        // WHEREs
        where        : aTmpl => { applyWhereTmpl(aTmpl, false); return code; },

        // Main queries
        starts       : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotStarts(aKey, aValue); else code.orStarts(aKey, aValue); } else { if (useNot) code.andNotStarts(aKey, aValue); else code.andStarts(aKey, aValue); } return code; },
        ends         : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotEnds(aKey, aValue); else code.orEnds(aKey, aValue); } else { if (useNot) code.andNotEnds(aKey, aValue); else code.andEnds(aKey, aValue); } return code; },
        equals       : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotEquals(aKey, aValue); else code.orEquals(aKey, aValue); } else { if (useNot) code.andNotEquals(aKey, aValue); else code.andEquals(aKey, aValue); } return code; },
        greater      : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotGreater(aKey, aValue); else code.orGreater(aKey, aValue); } else { if (useNot) code.andNotGreater(aKey, aValue); else code.andGreater(aKey, aValue); } return code; },
        less         : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotLess(aKey, aValue); else code.orLess(aKey, aValue); } else { if (useNot) code.andNotLess(aKey, aValue); else code.andLess(aKey, aValue); } return code; },
        greaterEquals: (aKey, aValue) => { if (useOr) { if (useNot) code.orNotGreaterEquals(aKey, aValue); else code.orGreaterEquals(aKey, aValue); } else { if (useNot) code.andNotGreaterEquals(aKey, aValue); else code.andGreaterEquals(aKey, aValue); } return code; },
        lessEquals   : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotLessEquals(aKey, aValue); else code.orLessEquals(aKey, aValue); } else { if (useNot) code.andNotLessEquals(aKey, aValue); else code.andLessEquals(aKey, aValue); } return code; },
        contains     : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotContains(aKey, aValue); else code.orContains(aKey, aValue); } else { if (useNot) code.andNotContains(aKey, aValue); else code.andContains(aKey, aValue); } return code; },
        empty        : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotEmpty(aKey, aValue); else code.orEmpty(aKey, aValue); } else { if (useNot) code.andNotEmpty(aKey, aValue); else code.andEmpty(aKey, aValue); } return code; },
        match        : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotMatch(aKey, aValue); else code.orMatch(aKey, aValue); } else { if (useNot) code.andNotMatch(aKey, aValue); else code.andMatch(aKey, aValue); } return code; },
        type         : (aKey, aValue) => { if (useOr) { if (useNot) code.orNotType(aKey, aValue); else code.orType(aKey, aValue); } else { if (useNot) code.andNotType(aKey, aValue); else code.andType(aKey, aValue); } return code; },
        between      : (aKey, aV1, aV2) => { if (useOr) { if (useNot) code.orNotBetween(aKey, aValue); else code.orBetween(aKey, aValue); } else { if (useNot) code.andNotBetween(aKey, aValue); else code.andBetween(aKey, aValue); } return code; },
        betweenEquals: (aKey, aV1, aV2) => { if (useOr) { if (useNot) code.orNotBetweenEquals(aKey, aValue); else code.orBetweenEquals(aKey, aValue); } else { if (useNot) code.andNotBetweenEquals(aKey, aValue); else code.andBetweenEquals(aKey, aValue); } return code; },
        is           : (aKey) => { if (useOr) { if (useNot) code.orNotIs(aKey, aValue); else code.orIs(aKey, aValue); } else { if (useNot) code.andNotIs(aKey, aValue); else code.andIs(aKey, aValue); } return code; },

        // Queries with and
        andStarts       : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).startsWith({v})", false); return code; },
        andEnds         : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).endsWith({v})", false); return code; },
        andEquals       : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} == {v}", false); return code; },
        andGreater      : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} > {v}", false); return code; },
        andLess         : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} < {v}", false); return code; },
        andGreaterEquals: (aKey, aValue) => { applyWhere(aKey, aValue, "{k} >= {v}", false); return code; },
        andLessEquals   : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} <= {v}", false); return code; },
        andContains     : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).indexOf({v}) >= 0", false); return code; },
        andEmpty        : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).length == 0", false); return code; },
        andMatch        : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).match({v})", false); return code; },
        andType         : (aKey, aValue) => { applyWhere(aKey, aValue, "typeof {k} == {v}", false); return code; },
        andBetween      : (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} > {v} && {k} < {v2})", false, true, aV2); return code; },
        andBetweenEquals: (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} >= {v} && {k} <= {v2})", false, true, aV2); return code; },
        andIs           : (aKey) => { applyWhere(aKey, "", "{k} != null && {k}", false); return code; },

        // Queries with not
        notStarts       : (aKey, aValue) => { if (useOr) code.orNotStarts(aKey, aValue); else code.andNotStarts(aKey, aValue); return code; },
        notEnds         : (aKey, aValue) => { if (useOr) code.orNotEnds(aKey, aValue); else code.andNotEnds(aKey, aValue); return code; },
        notEquals       : (aKey, aValue) => { if (useOr) code.orNotEquals(aKey, aValue); else code.andNotEquals(aKey, aValue); return code; },
        notGreater      : (aKey, aValue) => { if (useOr) code.orNotGreater(aKey, aValue); else code.andNotGreater(aKey, aValue); return code; },
        notLess         : (aKey, aValue) => { if (useOr) code.orNotLess(aKey, aValue); else code.andNotLess(aKey, aValue); return code; },
        notGreaterEquals: (aKey, aValue) => { if (useOr) code.orNotGreaterEquals(aKey, aValue); else code.andNotGreaterEquals(aKey, aValue); return code; },
        notLessEquals   : (aKey, aValue) => { if (useOr) code.orNotLessEquals(aKey, aValue); else code.andNotLessEquals(aKey, aValue); return code; },
        notContains     : (aKey, aValue) => { if (useOr) code.orNotContains(aKey, aValue); else code.andNotContains(aKey, aValue); return code; },
        notEmpty        : (aKey, aValue) => { if (useOr) code.orNotEmpty(aKey, aValue); else code.andNotEmpty(aKey, aValue); return code; },
        notMatch        : (aKey, aValue) => { if (useOr) code.orNotMatch(aKey, aValue); else code.andNotMatch(aKey, aValue); return code; },
        notType         : (aKey, aValue) => { if (useOr) code.orNotType(aKey, aValue); else code.andNotType(aKey, aValue); return code; },
        notBetween      : (aKey, aV1, aV2) => { if (useOr) code.orNotBetween(aKey, aValue); else code.andNotBetween(aKey, aValue); return code; },
        notBetweenEquals: (aKey, aV1, aV2) => { if (useOr) code.orNotBetweenEquals(aKey, aValue); else code.andNotBetweenEquals(aKey, aValue); return code; },
        notIs           : (aKey) => { if (useOr) code.orNotIs(aKey, aValue); else code.andNotIs(aKey, aValue); return code; },

        // Queries with and & not
        andNotStarts       : (aKey, aValue) => { applyWhere(aKey, aValue, "!(String({k}).startsWith({v}))", false); return code; },
        andNotEnds         : (aKey, aValue) => { applyWhere(aKey, aValue, "!(String({k}).endsWith({v}))", false); return code; },
        andNotEquals       : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} != {v}", false); return code; },
        andNotGreater      : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} <= {v}", false); return code; },
        andNotLess         : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} >= {v}", false); return code; },
        andNotGreaterEquals: (aKey, aValue) => { applyWhere(aKey, aValue, "{k} < {v}", false); return code; },
        andNotLessEquals   : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} > {v}", false); return code; },
        andNotContains     : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).indexOf({v}) < 0", false); return code; },
        andNotEmpty        : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).length != 0", false); return code; },
        andNotMatch        : (aKey, aValue) => { applyWhere(aKey, aValue, "!(String({k}).match({v}))", false); return code; },
        andNotType         : (aKey, aValue) => { applyWhere(aKey, aValue, "typeof {k} != {v}", false); return code; },
        andNotBetween      : (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} < {v} || {k} > {v2})", false, true, aV2); return code; },
        andNotBetweenEquals: (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} <= {v} || {k} >= {v2})", false, true, aV2); return code; },
        andNotIs           : (aKey) => { applyWhere(aKey, "", "{k} == null || !({k})", false); return code; },

        // Queries with or
        orStarts       : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).startsWith({v})", true); return code; },
        orEnds         : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).endsWith({v})", true); return code; },
        orEquals       : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} == {v}", true); return code; },
        orGreater      : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} > {v}", true); return code; },
        orLess         : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} < {v}", true); return code; },
        orGreaterEquals: (aKey, aValue) => { applyWhere(aKey, aValue, "{k} >= {v}", true); return code; },
        orLessEquals   : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} <= {v}", true); return code; },
        orContains     : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).indexOf({v}) >= 0", true); return code; },
        orEmpty        : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).length == 0", true); return code; },
        orMatch        : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).match({v})", true); return code; },
        orType         : (aKey, aValue) => { applyWhere(aKey, aValue, "typeof {k} == {v}", true); return code; },
        orBetween      : (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} > {v} && {k} < {v2})", true, aV2); return code; },
        orBetweenEquals: (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} >= {v} && {k} <= {v2})", true, aV2); return code; },
        orIs           : (aKey) => { applyWhere(aKey, "", "{k} != null && {k}", true); return code; },

        // Queries with or and not
        orNotStarts       : (aKey, aValue) => { applyWhere(aKey, aValue, "!(String({k}).startsWith({v}))", true); return code; },
        orNotEnds         : (aKey, aValue) => { applyWhere(aKey, aValue, "!(String({k}).endsWith({v}))", true); return code; },
        orNotEquals       : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} != {v}", true); return code; },
        orNotGreater      : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} <= {v}", true); return code; },
        orNotLess         : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} >= {v}", true); return code; },
        orNotGreaterEquals: (aKey, aValue) => { applyWhere(aKey, aValue, "{k} < {v}", true); return code; },
        orNotLessEquals   : (aKey, aValue) => { applyWhere(aKey, aValue, "{k} > {v}", true); return code; },
        orNotContains     : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).indexOf({v}) < 0", true); return code; },
        orNotEmpty        : (aKey, aValue) => { applyWhere(aKey, aValue, "String({k}).length != 0", true); return code; },
        orNotMatch        : (aKey, aValue) => { applyWhere(aKey, aValue, "!(String({k}).match({v}))", true); return code; },
        orNotType         : (aKey, aValue) => { applyWhere(aKey, aValue, "typeof {k} != {v}", true); return code; },
        orNotBetween      : (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} < {v} || {k} > {v2})", false, true, aV2); return code; },
        orNotBetweenEquals: (aKey, aV1, aV2) => { applyWhere(aKey, aV1, "({k} <= {v} || {k} >= {v2})", false, true, aV2); return code; },
        orNotIs           : (aKey) => { applyWhere(aKey, "", "{k} == null || !({k})", true); return code; },

        // SELECTS

        // Providing immediate result
        min    : aKey => {
            aKey = ($$(aKey).isDef() ? vKey(aKey) : void 0);
            var min;

            code.select(r => {
                var v = ($$(aKey).isDef() ? Number(r[aKey]) : Number(r));
                if (v != null && $$(v).isNumber()) {
                    if ($$(min).isUnDef()) {
                        min = r;
                    } else {
                        if ($$(aKey).isDef() && min[aKey] > v) min = r;
                        if ($$(aKey).isUnDef() && min > v) min = r;
                    }
                }
            });

            return min;
        },
        max    : aKey => {
            aKey = ($$(aKey).isDef() ? vKey(aKey) : void 0);
            var max;

            code.select(r => {
                var v = ($$(aKey).isDef() ? Number(r[aKey]) : Number(r));
                if (v != null && $$(v).isNumber()) {
                    if ($$(max).isUnDef()) {
                        max = r;
                    } else {
                        if ($$(aKey).isDef() && max[aKey] < v) max = r;
                        if ($$(aKey).isUnDef() && max < v) max = r;
                    }
                }
            });

            return max;
        },
        average: aKey => {
            aKey = ($$(aKey).isDef() ? vKey(aKey) : void 0);
            var sum = 0, c = 0;

            code.select(r => {
                var v = ($$(aKey).isDef() ? Number(r[aKey]) : Number(r));
                if (v != null && $$(v).isNumber()) {
                    c++;
                    sum += v;
                }
            });

            return (c > 0 ? sum / c : void 0);
        },
        sum: aKey => {
            aKey = ($$(aKey).isDef() ? vKey(aKey) : void 0);
            var sum = 0;

            code.select(r => {
                var v = ($$(aKey).isDef() ? Number(r[aKey]) : Number(r));
                if (v != null && $$(v).isNumber()) {
                    sum += v;
                }
            });

            return sum;
        },
        distinct: aKey => {
            aKey = ($$(aKey).isDef() ? vKey(aKey) : void 0);
            var vals = [];

            code.select(r => {
                var v = ($$(aKey).isDef() ? r[aKey] : r);
                if (vals.indexOf(v) < 0) vals.push(v);
            });

            return vals;
        },
        group  : aKey => {
            aKey = ($$(aKey).isDef() ? vKey(aKey) : void 0);
            var vals = {};

            code.select(r => {
                var v = ($$(aKey).isDef() ? r[aKey] : r);
                if (Object.keys(vals).indexOf(v) < 0) {
                    vals[v] = [ r ];
                } else {
                    vals[v].push(r);
                }
            });

            return vals;
        },
        at     : aParam => {
            _$(aParam, "index").isNumber().$_();

            res = applyConditions(res);
            return res[Number(aParam)];
        },
        all    : () => { res = applyConditions(res); return res.length == anObject.length; },
        count  : () => { res = applyConditions(res); return res.length; },
        first  : () => { res = applyConditions(res); return (res.length > 0 ? res[0] : void 0); },
        last   : () => { res = applyConditions(res); return (res.length > 0 ? res[res.length-1] : void 0); },
        any    : () => { res = applyConditions(res); return (res.length > 0); },
        none   : () => { res = applyConditions(res); return (res.length == 0); },
        reverse: () => { res = applyConditions(res); return res.reverse(); },

        // Applying to current result set
        each   : aFn => {
            _$(aFn, "function").isFunction().$_();

            code.select(aFn);

            return code;
        },
        attach : (aKey, aValue) => {
            _$(aKey, "key").$_();
            _$(aValue, "value").$_(); 

            res = applyConditions(res);

            aKey   = vKey(aKey);
            res = res.map(r => { r[aKey] = aValue; return r; });

            return code;
        },
        sort   : function() {
            var ssort = "";

            res = applyConditions(res);

            for(var o = 0; o < arguments.length; o++) {
                var k = arguments[o];
                var rev = false;
                if (k.startsWith("-")) {
                    rev = true;
                    k.substr(1, k.length -1);
                }

                if (ssort.length > 0) ssort += " || "; else ssort = "return ";
                if (rev) {
                    ssort += " b[\"" + k + "\"] - a[\"" + k + "\"] ";
                } else {
                    ssort += " a[\"" + k + "\"] - b[\"" + k + "\"] ";
                }
            }

            res = res.sort(new Function("a", "b", ssort));

            return code;
        },

        // Main selector
        select : aParam => {
            res = applyConditions(res);
            // no parameters
            if ($$(aParam).isUnDef()) {
                return res;
            } else {
                // function parameter
                if ($$(aParam).isFunction()) {
                    return res.map(aParam);
                } else {
                    // array parameter
                    if ($$(aParam).isArray()) {
                        aNewParam = {};
                        aParam.map(r => {
                            if ($$(r).isString()) aNewParam[r] = void 0;
                        });
                    }
                    // map parameter
                    if ($$(aParam).isMap()) {
                        var keys = Object.keys(aParam);
                        return res.map(r => {
                            var nr = {};
                            keys.map(k => {
                                if ($$(r[k]).isDef()) {
                                    nr[k] = r[k];
                                } else {
                                    nr[k] = aParam[k];
                                }
                            });
                            return nr;
                        });
                    }
                }
            }
        }
    };

    return code;
};

var _from = nLinq;

// openafsigil.js
//

const $$ = function(aObj) {
	const _r = {
		/**
		 * <odoc>
		 * <key>$$(aObject).get(aPath) : Object</key>
		 * Given aObject it will try to parse the aPath a retrive the corresponding object under that path. Example:\
		 * \
		 * var a = { a : 1, b : { c: 2, d: [0, 1] } };\
		 * \
		 * print($$(a).get("b.c")); // 2\
		 * sprint($$(a).get("b.d")); // [0, 1]\
		 * print($$(a).get("b.d[0]")); // 0\
		 * \
		 * </odoc>
		 */
		get: (aPath) => {
            if (!$$(aObj).isObject()) return void 0;

			aPath = aPath.replace(/\[(\w+)\]/g, '.$1');
			aPath = aPath.replace(/^\./, '');       

			var a = aPath.split('.');
			for (var i = 0, n = a.length; i < n; ++i) {
				var k = a[i];
				if (k in aObj) {
					aObj = aObj[k];
				} else {
					return;
				}
			}
            return aObj;
		},
		/**
		 * <odoc>
		 * <key>$$(aObject).set(aPath, aNewValue) : Object</key>
		 * Given aObject it will try to parse the aPath a set the corresponding object under that path to aNewValue. Example:\
		 * \
		 * var a = { a : 1, b : { c: 2, d: [0, 1] } };\
		 * \
		 * sprint($$(a).set("b.c", 123); // { a : 1, b : { c: 123, d: [0, 1] } }\
		 * \
		 * </odoc>
		 */		
		set: (aPath, aValue) => {
			if (!$$(aObj).isObject()) return void 0;
			var orig = aObj;
		
			aPath = aPath.replace(/\[(\w+)\]/g, '.$1');
			aPath = aPath.replace(/^\./, '');       
			
			var a = aPath.split('.');
			var prev, prevK;
			for (var i = 0, n = a.length; i < n; ++i) {
				var k = a[i];
				prev = aObj;
				prevK = k;
				if (k in aObj) {
					aObj = aObj[k];
				} else {
					aObj[k] = {};
					aObj = aObj[k];
				}
			}
			prev[prevK] = aValue;
			return orig;
        },
        isDef: () => { return (!(typeof aObj == 'undefined')) ? true : false; },
        isUnDef: () => { return (typeof aObj == 'undefined') ? true : false; },
        isArray: () => { return Array.isArray(aObj); },
        isMap: () => { return (Object.prototype.toString.call(aObj) == "[object Object]"); },
        isObject: () => { var type = typeof aObj; return type === 'function' || type === 'object' && !!aObj; },
        isFunction: () => { return typeof aObj == 'function' || false; },
        isString: () => { return typeof aObj == 'string' || false; },
        isNumber: () => { return !isNaN(parseFloat(aObj)) && isFinite(aObj); },
        isTNumber: () => { return typeof aObj == 'number' || false; },
        isBoolean: () => { return typeof aObj == 'boolean' || false; },
        isNull: () => { return null == aObj || false; },
        isDate: () => { return (null != aObj) && !isNaN(aObj) && ("undefined" !== typeof aObj.getDate); },
        isRegExp: () => { return (aObj instanceof RegExp); },
        isUUID: () => { return (aObj.match(/^\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/) ? true : false); },
        isSchema: (aSchema, aOptions) => {
            if (typeof Ajv == 'undefined') {
                if (typeof loadAjv != 'undefined')
                    loadAjv();
                else
                    throw "Ajv library not loaded.";
            }

            ow.loadObj();
            return ow.obj.schemaValidate(aSchema, aObj, aOptions);
        }
	};
	return _r;
};


const _$ = function(aValue, aPrefixMessage) {
    var defined;
    if ($$(aPrefixMessage).isDef()) aPrefixMessage += " "; else aPrefixMessage = "";
    if ($$(aValue).isDef()) defined = true; else defined = false;

    const __r = {
        // Defaults
        /**
         * <odoc>
         * <key>_$(aObject, anErrorMessagePrefix)</key>
         * Shortcut to facilitate argument pre-validation and promote defensive programming.\
         * \
         * .default(aNewObject) : aObject\
         * Checks if aObject is defined and returns aObject. If it's not defined it will return aNewObject (the default value).\
         * \
         * $_(aMessage) : aObject\
         * Throws an exception with aMessage if aObject is not defined otherwise returns aObject.
         * </odoc>
         */
        default : (aVal) => {
            if (!defined) return aVal; else return aValue;
        },
        $_ : (aMessage) => {
			if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "not defined or assigned";
			if (!defined) throw aMessage;
			return aValue;
		},
		
		// Type check
        isNumber: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a number";
            if (defined && !$$(aValue).isNumber()) throw aMessage;
            return __r;
        },
        isTNumber: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a number type";
            if (defined && !$$(aValue).isTNumber()) throw aMessage;
            return __r;
        },
        isString: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a string";
            if (defined && !$$(aValue).isString()) throw aMessage;
            return __r;
        },
        isBoolean: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not boolean";
            if (defined && (typeof aValue !== "boolean")) throw aMessage;
            return __r;
        },
        isArray: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not an array";
            if (defined && !$$(aValue).isArray()) throw aMessage;
            return __r;
        },
        isMap: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a map";
            if (defined && !$$(aValue).isMap()) throw aMessage;
            return __r;
        },
        isObject: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not an object";
            if (defined && !$$(aValue).isObject()) throw aMessage;
            return __r;
        },
        isDate: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a date";
            if (defined && !$$(aValue).isDate()) throw aMessage;
            return __r;
        },    
        isRegExp: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a RegExp";
            if (defined && !$$(aValue).isRegExp()) throw aMessage;
            return __r;
        },                    
        isFunction: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a function";
            if (defined && !$$(aValue).isFunction()) throw aMessage;
            return __r;
        },        
		isJavaObject: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not a java object";
            if (defined && !isJavaObject(aValue)) throw aMessage;
            return __r;
		},
		isInstanceOf: (aClass, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not an instance of " + aClass;
            if (defined && !(aValue instanceof aClass)) throw aMessage;
            return __r;
        },
        isNotNull: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is null";
            if (defined && (aValue == null)) throw aMessage;
            return __r;
        },
        isUUID: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not an UUID";
            if (defined && (!$$(aValue).isString() || aValue.match(/^\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/))) throw aMessage;
            return __r;
        },
        isSchema: (aSchema, aMessage, aOptions) => {
            if (typeof Ajv == 'undefined') {
                if (typeof loadAjv != 'undefined')
                    loadAjv();
                else
                    throw "Ajv library not loaded.";
            }

            ow.loadObj(); 
            try { 
                ow.obj.schemaValidate(aSchema, aValue, aOptions);
            } catch(e) { 
                if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + " " + String(e);
                throw aMessage;
            }
            return __r;
        },
		// Generic validations
        check: (aFunction, aMessage) => {
			if (!$$(aFunction).isFunction() && !$$(aFunction).isString()) throw "please provide a function to check";
            var res = ($$(aFunction).isFunction() ? aFunction(aValue) : (new Function('v', 'return ' + aFunction))(aValue));
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not ok";
            if (defined && !res) throw aMessage;
            return __r;
        },
        expr: (aEval, aMessage) => {
			if (!$$(aEval).isString()) throw "please provide an expression";
            var res = af.eval(templify(aEval, { v: aValue }));
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not ok";
            if (defined && !res) throw aMessage;
            return __r;
		},
		equals: (aVal, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is equals to " + aVal;
            if (defined && aValue == aVal) throw aMessage;
            return __r;
        }        ,
        notEquals: (aVal, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not equals to " + aVal;
            if (defined && aValue != aVal) throw aMessage;
            return __r;
		},
		anyOf: (aVals, aMessage) => {
			if (!$$(aVals).isArray()) throw "please provide an array of values";
			if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "has a value not in " + JSON.stringify(aVals);
			if (defined && $$(aValue).isArray()) {
				aValue.forEach((v) => { 
					if (aVals.indexOf(v) < 0) throw aMessage;
				});
            }
            return __r;
		},
		oneOf: (aVals, aMessage) => {
			if (!$$(aVals).isArray()) throw "please provide an array of values";
			if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not one of " + JSON.stringify(aVals);
            if (defined && !$$(aValue).isArray() && aVals.indexOf(aValue) < 0) throw aMessage;
            return __r;
		},
		
		// Numeric validations
        between: (aValA, aValB, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not between " + aValA + " and " + aValB;
            if (defined && (aValue >= aValB || aValue <= aValA)) throw aMessage;
        },
        betweenEquals: (aValA, aValB, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not between " + aValA + " and " + aValB;
            if (defined && (aValue > aValB || aValue < aValA)) throw aMessage;
        },        
        less: (aVal, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is less than " + aVal;
            if (defined && aValue > aVal) throw aMessage;
            return __r;
        },
        lessEquals: (aVal, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is less or equals than " + aVal;
            if (defined && aValue >= aVal) throw aMessage;
            return __r;
        },
        greater: (aVal, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is greater than " + aVal;
            if (defined && aValue < aVal) throw aMessage;
            return __r;
        },
        greaterEquals: (aVal, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is greater or equals than " + aVal;
            if (defined && aValue <= aVal) throw aMessage;
            return __r;
        },
		
		// String validations
        notEmpty: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is empty";
            if (defined && String(aValue) == "") throw aMessage;
            return __r;
        },
        empty: (aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "is not empty";
            if (defined && String(aValue) != "") throw aMessage;
            return __r;
        },
        contains: (aVal, aMessage) => {
			if (!$$(aVal).isString()) throw "please provide a string to check if contains";
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "doesn't contain " + aVal;
            if (defined && String(aValue).indexOf(aVal) < 0) throw aMessage;
            return __r;
        },
        notContains: (aVal, aMessage) => {
			if (!$$(aVal).isString()) throw "please provide a string to check if not contains";
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "contains " + aVal;
            if (defined && String(aValue).indexOf(aVal) >= 0) throw aMessage;
            return __r;
        },
        starts: (aVal, aMessage) => {
			if (!$$(aVal).isString()) throw "please provide a string to check if it starts with";
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "doesn't start with '" + aVal + "'";
            if (defined && !(aValue.startsWith(aValu))) throw aMessage;
            return __r;
        },
        ends: (aVal, aMessage) => {
			if (!$$(aVal).isString()) throw "please provide a string to check if it ends with";			
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "doesn't end with '" + aVal + "'";
            if (defined && !(aValue.endsWith(aVal))) throw aMessage;
            return __r;
        },
        notStarts: (aVal, aMessage) => {
			if (!$$(aVal).isString()) throw "please provide a string to check if it not starts with";			
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "starts with '" + aVal + "'";
            if (defined && (aValue.startsWith(aValu))) throw aMessage;
            return __r;
        },
        notEnds: (aVal, aMessage) => {
			if (!$$(aVal).isString()) throw "please provide a string to check if it not ends with";			
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "ends with '" + aVal + "'";
            if (defined && (aValue.endsWith(aVal))) throw aMessage;
            return __r;
        },
        regexp: (aRegExp, aMessage) => {
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "doesn't match '" + aRegExp + "'";
            if (!(aRegExp instanceof RegExp)) throw "is not a regular expression (" + aRegExp + ")";
            if (defined && !aRegExp.test(aValue)) throw aMessage;
            return __r;
        },
        javaRegexp: (aRegExp, aMods, aMessage) => {
			if ($$(aRegExp).isUnDef() || !$$(aRegExp).isString()) throw "please provide a regular expression string";
            if ($$(aMessage).isUnDef()) aMessage = aPrefixMessage + "doesn't match '" + aRegExp + "'";
            if (defined && !javaRegExp(aValue).test(aRegExp, aMods)) throw aMessage;
            return __r;
        }
    };
    return __r;
};
