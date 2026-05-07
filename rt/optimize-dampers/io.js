// optimize-dampers io 1.1.0-compact-prep
function readPrep(cb) {
  kvsGet(KEY_PREP_OBJECT, function (v) {
    if (!v) { cb(null); return; }
    if (typeof v === "string") { cb(parseCompactPrep(v)); return; }
    cb(v);
  });
}

function writePlan(p, cb) {
  kvsSet(KEY_PLAN_OBJECT, p, function () {
    log("OK plan=" + p.plan + " heat=" + p.delivered_heat_kwh + " cost=" + p.cost);
    if (cb) cb();
  });
}
