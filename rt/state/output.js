// state output 1.1.2
function writeStateRun(run, cb) {
  kvsSet(KEY_STATE_RUN, run, cb);
}

function writeStateStatus(run, cb) {
  var s = "ST OK SR=" + run.sup + " ER=" + run.ext + " VR=" + run.vvx + " H=" + run.heat + " C=" + run.cool;
  Shelly.call("Text.Set", { id: STATE_STATUS_TEXT_ID, value: s }, function () {
    if (cb) cb();
  });
}
