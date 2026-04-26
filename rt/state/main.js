// state main 1.2.7-debug-checkpoints-100ms
function stateDbg(s, cb) {
  Shelly.call("Text.Set", { id: STATE_STATUS_TEXT_ID, value: String(s || "") }, function () {
    if (cb) cb();
  });
}

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

function stateStep(tag, fn, cb) {
  stateDbg(tag, function () {
    statePause(function () {
      fn(cb);
    });
  });
}

function runState() {
  var ctx = createStateCtx();

  log("BOT");
  stateDbg("S D0 BOT", function () {
    stateStep("S D1 IN", function (next) {
      readInput(ctx, next);
    }, function () {
      stateStep("S D2 SR", function (next) {
        applySupplyRun(ctx, next);
      }, function () {
        stateStep("S D3 ER", function (next) {
          applyExtractRun(ctx, next);
        }, function () {
          stateStep("S D4 VR", function (next) {
            applyVvxRun(ctx, next);
          }, function () {
            stateStep("S D5 HR", function (next) {
              applyHeatRun(ctx, next);
            }, function () {
              stateStep("S D6 CR", function (next) {
                applyCoolRun(ctx, next);
              }, function () {
                stateStep("S D7 DR", function (next) {
                  applyDampersRun(ctx, next);
                }, function () {
                  stateStep("S D8 WO", function (next) {
                    writeStateOutput(ctx, next);
                  }, function () {
                    stateStep("S D9 PWR", function (next) {
                      applyPowerFeature(ctx, next);
                    }, function () {
                      stateStep("S D10 EFF", function (next) {
                        applyVvxEfficiencyFeature(ctx, next);
                      }, function () {
                        stateStep("S D11 FAN", function (next) {
                          applyFanAverageFeature(ctx, next);
                        }, function () {
                          stateStep("S D12 STA", function (next) {
                            writeStateStatus(ctx, next);
                          }, function () {
                            stateDbg("S D13 DON", function () {
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
}

runState();
