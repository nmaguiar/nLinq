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
}
