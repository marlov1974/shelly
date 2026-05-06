// prep-dampers output 1.1.0-one-output
function writePrep(p, cb) {
  kvsSet(KEY_PREP_OBJECT, p, function () {
    log("OK req=" + p.required_heat_kwh + " plan=" + p.start_plan);
    if (cb) cb();
  });
}
