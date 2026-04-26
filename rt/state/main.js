// state main 1.2.10-clean-250ms-every-main-step
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

function stateStep(fn, cb) {
  fn(function () {
    statePause(cb);
  });
}

function runState() {
  var ctx = createStateCtx();

  log("BOT");

  stateStep(function (next) {
    readInput(ctx, next);
  }, function () {
    stateStep(function (next) {
      applySupplyRun(ctx, next);
    }, function () {
      stateStep(function (next) {
        applyExtractRun(ctx, next);
      }, function () {
        stateStep(function (next) {
          applyVvxRun(ctx, next);
        }, function () {
          stateStep(function (next) {
            applyHeatRun(ctx, next);
          }, function () {
            stateStep(function (next) {
              applyCoolRun(ctx, next);
            }, function () {
              stateStep(function (next) {
                applyDampersRun(ctx, next);
              }, function () {
                stateStep(function (next) {
                  writeStateOutput(ctx, next);
                }, function () {
                  stateStep(function (next) {
                    applyPowerFeature(ctx, next);
                  }, function () {
                    stateStep(function (next) {
                      applyVvxEfficiencyFeature(ctx, next);
                    }, function () {
                      stateStep(function (next) {
                        applyFanAverageFeature(ctx, next);
                      }, function () {
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
