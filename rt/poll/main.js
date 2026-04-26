// poll main 3.2.0-classic-apply
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

function applyAll(ctx) {
  applySupply(ctx);
  applyExtract(ctx);
  applyProcess(ctx);
  applyHeat(ctx);
  applyCool(ctx);
  applyVvx(ctx);
  applyDampers(ctx);
}

function runPoll() {
  var ctx = createPollCtx();
  log("BOT");

  readAll(ctx, function () {
    applyAll(ctx);
    writeTelemetryM(ctx, function () {
      writeTelemetryAct(ctx, function () {
        writePollStatus(ctx, function () {
          log("DON");
        });
      });
    });
  });
}

runPoll();
