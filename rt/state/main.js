// state main 1.2.11-rpc-only-250ms-yield-retest
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

function stateRpcStep(fn, cb) {
  fn(function () {
    statePause(cb);
  });
}

function applyRunCalculations(ctx, cb) {
  applySupplyRun(ctx, function () {
    applyExtractRun(ctx, function () {
      applyVvxRun(ctx, function () {
        applyHeatRun(ctx, function () {
          applyCoolRun(ctx, function () {
            applyDampersRun(ctx, cb);
          });
        });
      });
    });
  });
}

function runState() {
  var ctx = createStateCtx();

  log("BOT");

  stateRpcStep(function (next) {
    readInput(ctx, next);
  }, function () {
    applyRunCalculations(ctx, function () {
      stateRpcStep(function (next) {
        writeStateOutput(ctx, next);
      }, function () {
        stateRpcStep(function (next) {
          applyPowerFeature(ctx, next);
        }, function () {
          stateRpcStep(function (next) {
            applyVvxEfficiencyFeature(ctx, next);
          }, function () {
            stateRpcStep(function (next) {
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
}

runState();
