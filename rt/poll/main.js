// poll main 3.1.2-debug-checkpoints
function pollDbg(s, cb) {
  Shelly.call("Text.Set", { id: POLL_STATUS_TEXT_ID, value: String(s || "") }, function () {
    if (cb) cb();
  });
}

function runPoll() {
  var ctx = createPollCtx();
  log("BOT");

  pollDbg("P D0 BOT", function () {
    pollDbg("P D1 SUP", function () {
      readSupply(ctx, function () {
        pollDbg("P D2 EXT", function () {
          readExtract(ctx, function () {
            pollDbg("P D3 PROC", function () {
              readProcess(ctx, function () {
                pollDbg("P D4 HEAT", function () {
                  readHeat(ctx, function () {
                    pollDbg("P D5 COOL", function () {
                      readCool(ctx, function () {
                        pollDbg("P D6 VVX", function () {
                          readVvx(ctx, function () {
                            pollDbg("P D7 DMP", function () {
                              readDampers(ctx, function () {
                                pollDbg("P D8 WTM", function () {
                                  writeTelemetryM(ctx, function () {
                                    pollDbg("P D9 WTA", function () {
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
