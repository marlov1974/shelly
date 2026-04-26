// state main 1.2.6-step-delay-100ms
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
  Timer.set(100, false, function () {
    cb();
  });
}

function runState() {
  var ctx = createStateCtx();

  log("BOT");
  readInput(ctx, function () {
    statePause(function () {
      applySupplyRun(ctx, function () {
        statePause(function () {
          applyExtractRun(ctx, function () {
            statePause(function () {
              applyVvxRun(ctx, function () {
                statePause(function () {
                  applyHeatRun(ctx, function () {
                    statePause(function () {
                      applyCoolRun(ctx, function () {
                        statePause(function () {
                          applyDampersRun(ctx, function () {
                            statePause(function () {
                              writeStateOutput(ctx, function () {
                                statePause(function () {
                                  applyPowerFeature(ctx, function () {
                                    statePause(function () {
                                      applyVvxEfficiencyFeature(ctx, function () {
                                        statePause(function () {
                                          applyFanAverageFeature(ctx, function () {
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
