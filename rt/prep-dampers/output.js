// prep-dampers output 1.0.0
function writePrep(p, cb) {
  kvsSet(KEY_PREP_OBJECT, p, function () {
    kvsSet(KEY_PREP_START_PLAN, p.start_plan, function () {
      kvsSet(KEY_PREP_REQUIRED_HEAT_KWH, String(p.required_heat_kwh), function () {
        kvsSet(KEY_PREP_UPDATED, p.updated, function () {
          kvsSet(KEY_PREP_STATUS, "ok", function () {
            log("OK req=" + p.required_heat_kwh + " plan=" + p.start_plan);
            if (cb) cb();
          });
        });
      });
    });
  });
}
