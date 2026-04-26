// poll main 3.1.5-clean
function runPoll() {
  var ctx = createPollCtx();
  log("BOT");

  readSupply(ctx, function () {
    readExtract(ctx, function () {
      readProcess(ctx, function () {
        readHeat(ctx, function () {
          readCool(ctx, function () {
            readVvx(ctx, function () {
              readDampers(ctx, function () {
                writeTelemetryM(ctx, function () {
                  writeTelemetryAct(ctx, function () {
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
}

runPoll();
