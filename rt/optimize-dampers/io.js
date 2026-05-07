// optimize-dampers io 1.0.0
function readPrep(cb) {
  kvsGet(KEY_PREP_OBJECT, function (v) {
    if (!v) { cb(null); return; }
    if (typeof v === "string") {
      try { v = JSON.parse(v); } catch (e) { v = null; }
    }
    cb(v);
  });
}

function writePlan(p, cb) {
  kvsSet(KEY_PLAN_OBJECT, p, function () {
    log("OK plan=" + p.plan + " heat=" + p.delivered_heat_kwh + " cost=" + p.cost);
    if (cb) cb();
  });
}
