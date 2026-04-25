// state main 1.2.0
function readInput(ctx, cb) {
  kvsGet(KEY_TEL_M, function (telM) {
    ctx.telM = telM || {};
    kvsGet(KEY_TEL_ACT, function (telAct) {
      ctx.telAct = telAct || {};
      cb();
    });
  });
}

function runState() {
  var ctx = createStateCtx();

  log("BOT");
  readInput(ctx, function () {
    applySupplyRun(ctx, function () {
      applyExtractRun(ctx, function () {
        applyVvxRun(ctx, function () {
          applyHeatRun(ctx, function () {
            applyCoolRun(ctx, function () {
              applyDampersRun(ctx, function () {
                writeStateOutput(ctx, function () {
                  applyPowerFeature(ctx, function () {
                    applyVvxEfficiencyFeature(ctx, function () {
                      applyFanAverageFeature(ctx, function () {
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
}

runState();
