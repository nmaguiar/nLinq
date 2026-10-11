pselect : aParam => {
    var pres = splitArray(res);
    var fRes = [];
    parallel4Array(pres, ares => {
        try {
        var rr = nLinq(ares)._setState(code._getState()).select(aParam);
        return rr;
        } catch(e) { sprintErr(e);}
    }).map(rs => {
        fRes = fRes.concat(rs);
    });
    return fRes;
},
// OpenAF-only, explicit per-query opt-in. Filters/projections execute once before reduction.
gpu: options => {
    if (options !== undefined && (options === null || typeof options != "object" || Array.isArray(options))) throw new TypeError("gpu options must be a map");
    code.__gpuOptions = options === undefined ? {} : options;
    if (!code.__gpuWrapped) {
        ["sum", "average", "min", "max"].forEach(operation => {
            var original = code[operation];
            code[operation] = key => key === undefined ? code._gpuAggregate(operation) : original(key);
        });
        code.__gpuWrapped = true;
    }
    return code;
},
_gpuAggregate: operation => {
    var rows = code.select(), options = code.__gpuOptions;
    var fallback = () => nLinq(rows)[operation]();
    if (!options || options.useGPU === false || __flags.PFOREACH.useGPU === false || /^(false|0|no|off)$/i.test(String(java.lang.System.getenv("OAF_PFOREACH_GPU")))) return fallback();
    var service;
    try {
        if (typeof ow.loadGPU != "function") {
            var root = getOPackPath("GPU");
            if (isUnDef(root)) return fallback();
            loadLib(root + "/gpu.js");
        }
        service = ow.loadGPU();
    } catch(e) { return fallback(); }
    // Do not retry if a caller-supplied fallback throws.
    return typeof service.aggregate == "function" ? service.aggregate(rows, operation, fallback, options) : fallback();
}
