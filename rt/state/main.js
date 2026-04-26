// state main 1.2.4-debug-checkpoints
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

function runState() {
  var ctx = createStateCtx();

  log("BOT");
  stateDbg("S D0 BOT", function () {
    stateDbg("S D1 IN", function () {
      readInput(ctx, function () {
        stateDbg("S D2 SR", function () {
          applySupplyRun(ctx, function () {
            stateDbg("S D3 ER", function () {
              applyExtractRun(ctx, function () {
                stateDbg("S D4 VR", function () {
                  applyVvxRun(ctx, function () {
                    stateDbg("S D5 HR", function () {
                      applyHeatRun(ctx, function () {
                        stateDbg("S D6 CR", function () {
                          applyCoolRun(ctx, function () {
                            stateDbg("S D7 DR", function () {
                              applyDampersRun(ctx, function () {
                                stateDbg("S D8 WO", function () {
                                  writeStateOutput(ctx, function () {
                                    stateDbg("S D9 PWR", function () {
                                      applyPowerFeature(ctx, function () {
                                        stateDbg("S D10 EFF", function () {
                                          applyVvxEfficiencyFeature(ctx, function () {
                                            stateDbg("S D11 FAN", function () {
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
