// state output 1.0.0
function writeStateRun(run, cb) {
  kvsSet(KEY_STATE_RUN, run, cb);
}

function writeStateHist(hist, cb) {
  kvsSet(KEY_STATE_HIST, hist, cb);
}

function writeTotalPowerValue(v, cb) {
  numberSet(TOTAL_POWER_ID, v, cb);
}

function writeVvxEfficiencyValue(v, cb) {
  numberSet(VVX_EFFICIENCY_ID, v, cb);
}

function writeFanSpeedAvgValue(v, cb) {
  numberSet(FAN_SPEED_AVG_ID, v, cb);
}

function writeStateStatus(run, perf, cb) {
  var s = "ST OK SR=" + run.sup + " ER=" + run.ext + " VR=" + run.vvx + " H=" + run.heat + " C=" + run.cool;
  Shelly.call("Text.Set", { id: STATE_STATUS_TEXT_ID, value: s }, function () {
    if (cb) cb();
  });
}
