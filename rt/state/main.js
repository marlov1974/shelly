// state main 1.3.2-self-stop
function readInput(ctx, cb) {
  kvsGet(KEY_TEL_M, function (telM) {
    ctx.telM = telM || {};
    kvsGet(KEY_TEL_ACT, function (telAct) {
      ctx.telAct = telAct || {};
      cb();
    });
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
    readVvxEfficiencyHist(function (hist) {
      applyRunCalculations(ctx);
      applyPerfCalculations(ctx, hist || {});
      writeStateOutput(ctx, function () {
        writePowerFeature(ctx, function () {
          writeVvxEfficiencyFeature(ctx, function () {
            writeFanAverageFeature(ctx, function () {
              writeStateStatus(ctx, function () {
                log("DON");
                selfStop();
              });
            });
          });
        });
      });
    });
  });
}

runState();
