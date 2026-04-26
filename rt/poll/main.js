// poll main 3.2.2-self-stop
function readAll(ctx, cb) {
  readSupply(ctx, function () {
    readExtract(ctx, function () {
      readProcess(ctx, function () {
        readHeat(ctx, function () {
          readCool(ctx, function () {
            readVvx(ctx, function () {
              readDampers(ctx, cb);
            });
          });
        });
      });
    });
  });
}

function runPoll() {
  var ctx = createPollCtx();
  log("BOT");

  readAll(ctx, function () {
    writeTelemetryM(ctx, function () {
      writeTelemetryAct(ctx, function () {
        writePollStatus(ctx, function () {
          log("DON");
          selfStop();
        });
      });
    });
  });
}

runPoll();
