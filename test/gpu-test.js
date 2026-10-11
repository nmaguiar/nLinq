// Run from nLinq/: oaf -f test/gpu-test.js
load("dist/openafnlinq.js");
var savedGPU = ow.gpu, savedLoader = ow.loadGPU, calls = 0, checks = 0;
function check(value, label) { checks++; if (!value) throw new Error(label); }
try {
    ow.gpu = { aggregate: function(values, operation, fallback, options) {
        calls++; check(Array.isArray(values), "Selected rows passed to reducer"); return fallback();
    }};
    ow.loadGPU = function() { return ow.gpu; };
    check(nLinq([1,2,3]).sum() === 6 && calls === 0, "Ordinary queries unchanged");
    var disabled = /^(false|0|no|off)$/i.test(String(java.lang.System.getenv("OAF_PFOREACH_GPU"))) || __flags.PFOREACH.useGPU === false;
    check(nLinq([1,2,3]).gpu().sum() === 6, "Opt-in sum");
    check(calls === (disabled ? 0 : 1), "Optional delegation");
    var visits = 0;
    check(nLinq([1,2,3]).where(v => {visits++; return v > 1}).gpu().sum() === 5, "Filtered sum");
    check(visits === 3, "Filter executed once");
    var before = calls;
    check(nLinq([{x:1},{x:2}]).gpu().sum("x") === 3 && calls === before, "Keyed aggregate retains CPU");
    check(nLinq([1,2,3]).gpu({useGPU:false}).sum() === 6 && calls === before, "Per-query bypass");
    check(nLinq([]).gpu().average() === undefined, "Empty average");
    check(nLinq([1,2,3]).gpu().gpu().max() === 3, "Repeated opt-in does not recurse");
    check(nLinq([1,2,3]).gpu().min() === 1, "Minimum");
    check(nLinq([1,2,3]).gpu().average() === 2, "Average");
    print("nLinq GPU adapter: " + checks + " checks passed");
} finally {
    ow.gpu = savedGPU; ow.loadGPU = savedLoader;
}
