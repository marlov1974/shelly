// state main 1.2.12-rpc-only-read-1500ms-yield-test
function readInput(ctx, cb) {
  kvsGet(KEY_TEL_M, function (telM) {
    ctx.telM = telM || {};
    kvsGet(KEY_TEL_ACT, function (telAct) {
      ctx.telAct = telAct || {};
      cb();
    });
  });
}

function statePauseMs(ms, cb) {
  Timer.set(ms, false, function () {
    cb();
  });
}

function stateRpcStep(ms, fn, cb) {
  fn(function () {
    statePauseMs(ms, cb);
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

  stateRpcStep(1500, function (next) {
    readInput(ctx, next);
  }, function () {
    applyRunCalculations(ctx, function () {
      stateRpcStep(250, function (next) {
        writeStateOutput(ctx, next);
      }, function () {
        stateRpcStep(250, function (next) {
          applyPowerFeature(ctx, next);
        }, function () {
          stateRpcStep(250, function (next) {
            applyVvxEfficiencyFeature(ctx, next);
          }, function () {
            stateRpcStep(250, function (next) {
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
