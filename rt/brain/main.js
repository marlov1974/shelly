// brain main 2.0.0-structured
function calculateBrain(ctx) {
  mapInputs(ctx);
  calcTarget(ctx);
  calcVentilation(ctx);
  calcThermal(ctx);
  calcVvx(ctx);
  buildIntent(ctx);
}

function runBrain() {
  var ctx = createBrainCtx();

  log("BOT");

  readCommands(ctx, function () {
    readTelemetry(ctx, function () {
      readWeather(ctx, function () {
        readForcedMode(ctx, function () {
          applyForcedModeTimeout(ctx, function () {
            calculateBrain(ctx);
            writeTargetToHouse(ctx, function () {
              writeIntent(ctx, function () {
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

runBrain();
