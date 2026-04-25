// poll main 2.0.0
function runPoll() {
  var ctx = createPollCtx();
  log("BOT");

  readSupply(ctx, function () {
    readExtract(ctx, function () {
      readProcess(ctx, function () {
        readActuators(ctx, function () {
          readVvxEffHist(ctx, function () {
            deriveCrossFeatures(ctx, function () {
              writeTelemetryM(ctx, function () {
                writeTelemetryAct(ctx, function () {
                  writeVvxEffRawHist(ctx, function () {
                    writeTotalPower(ctx, function () {
                      writeVvxEfficiency(ctx, function () {
                        writeFanSpeedAvg(ctx, function () {
                          writePollStatus(ctx, function () {
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

runPoll();
