// state main 1.0.0
function readInput(cb) {
  kvsGet(KEY_TEL_M, function (telM) {
    kvsGet(KEY_TEL_ACT, function (telAct) {
      kvsGet(KEY_STATE_HIST, function (hist) {
        cb(telM || {}, telAct || {}, hist || {});
      });
    });
  });
}

function runState() {
  log("BOT");
  readInput(function (telM, telAct, hist) {
    var run = calcRun(telM, telAct);
    var perf = calcPerf(telM, telAct, hist);

    writeStateRun(run, function () {
      writeStateHist(perf.hist, function () {
        writeTotalPowerValue(perf.total_w, function () {
          writeVvxEfficiencyValue(perf.vvx_eff_pct, function () {
            writeFanSpeedAvgValue(perf.fan_avg_pct, function () {
              writeStateStatus(run, perf, function () {
                log("DON");
              });
            });
          });
        });
      });
    });
  });
}

runState();
