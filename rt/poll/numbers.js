// poll numbers 3.3.0-normalizers
function normTemp(v) { return d1(clip(v, -99.9, 99.9)); }
function normRh(v) { return i(clip(v, 0, 100)); }
function normPpm(v) { return i(clip(v, 0, 2000)); }
function normPa(v) { return i(clip(v, 0, 999)); }
function normLs(v) { return i(clip(v, 0, 999)); }
function normPct(v) { return i(clip(v, 0, 100)); }
function normFanRpm(v) { return i(clip(v, 0, 9999)); }
function normVvxRpm(v) { return i(clip(v, 0, 999)); }
function normW(v) { return i(clip(v, 0, 9999)); }
