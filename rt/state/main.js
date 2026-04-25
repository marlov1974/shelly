// state main 1.1.3
function readInput(cb) {
  kvsGet(KEY_TEL_M, function (telM) {
    kvsGet(KEY_TEL_ACT, function (telAct) {
      cb(telM || {}, telAct || {});
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

  log("BOT");
  readInput(function (telM, telAct) {
    run = buildRun(telM, telAct);

    writeStateRun(run, function () {
      runPowerFeature(telM, telAct, function () {
        runVvxEfficiencyFeature(telM, function () {
          runFanAverageFeature(telM, telAct, function () {
            writeStateStatus(run, function () {
              log("DON");
            });
          });
        });
      });
    });
  });
}

runState();
