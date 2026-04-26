// state main 1.3.0-classic-calc-callback-rpc
function readInput(ctx, cb) {
  kvsGet(KEY_TEL_M, function (telM) {
    ctx.telM = telM || {};
    kvsGet(KEY_TEL_ACT, function (telAct) {
      ctx.telAct = telAct || {};
      cb();
    });
  });
}

function statePause(cb) {
  Timer.set(250, false, function () {
    cb();
  });
}

function applyRunCalculations(ctx) {
  applySupplyRun(ctx);
  applyExtractRun(ctx);
  applyVvxRun(ctx);
  applyHeatRun(ctx);
  applyCoolRun(ctx);
  applyDampersRun(ctx);
}

function applyPerfCalculations(ctx, hist) {
  calcPowerFeature(ctx);
  calcVvxEfficiencyFeature(ctx, hist || {});
  calcFanAverageFeature(ctx);
}

function runState() {
  var ctx = createStateCtx();

  log("BOT");

  readInput(ctx, function () {
    statePause(function () {
      readVvxEfficiencyHist(function (hist) {
        statePause(function () {
          applyRunCalculations(ctx);
          applyPerfCalculations(ctx, hist || {});

          writeStateOutput(ctx, function () {
            statePause(function () {
              writePowerFeature(ctx, function () {
                statePause(function () {
                  writeVvxEfficiencyFeature(ctx, function () {
                    statePause(function () {
                      writeFanAverageFeature(ctx, function () {
                        statePause(function () {
                          writeStateStatus(ctx, function () {
                            log("DON");
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

runState();
