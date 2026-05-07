// prep-dampers output 1.7.0-compact-output
function writePrep(p, cb) {
  kvsSet(KEY_PREP_OBJECT, p, function (ok) {
    if (!ok) { log("WRITE ERR"); if (cb) cb(); return; }
    log("OK " + String(p).substring(0, 80));
    if (cb) cb();
  });
}
