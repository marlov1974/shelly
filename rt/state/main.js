// state main 1.1.0
function readInput(cb) {
  kvsGet(KEY_TEL_M, function (telM) {
    kvsGet(KEY_TEL_ACT, function (telAct) {
      kvsGet(KEY_STATE_HIST, function (hist) {
        cb(telM || {}, telAct || {}, hist || {});
      });
    });
  });
}

function buildRun(telM, telAct) {
  return {
    sup: calcSupplyRun(telM, telAct),
    ext: calcExtractRun(telM, telAct),
    vvx: calcVvxRun(telM, telAct),
    heat: calcHeatRun(telM, telAct),
    cool: calcCoolRun(telM, telAct),
    dmp: calcDampersRun(telM, telAct)
  };
}

function runState() {
  var run;
  var totalW;
  var vvxEff;
  var fanAvg;

  log("BOT");
  readInput(function (telM, telAct, hist) {
    run = buildRun(telM, telAct);
    totalW = calcPower(telM, telAct);
    vvxEff = calcVvxEfficiency(telM, hist);
    fanAvg = calcFanAverage(telM, telAct);

    writeStateRun(run, function () {
      writeStateHist(vvxEff.hist, function () {
        writeTotalPowerValue(totalW, function () {
          writeVvxEfficiencyValue(vvxEff.pct, function () {
            writeFanSpeedAvgValue(fanAvg, function () {
              writeStateStatus(run, function () {
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
