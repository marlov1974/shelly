// poll main 3.0.0
function runPoll() {
  var ctx = createPollCtx();
  log("BOT");

  readSupply(ctx, function () {
    readExtract(ctx, function () {
      readProcess(ctx, function () {
        readActuators(ctx, function () {
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
}

runPoll();
