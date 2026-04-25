// poll main 2.0.1-debug
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
                pollDbg("P D4 ACT", function () {
                  readActuators(ctx, function () {
                    pollDbg("P D5 HIST", function () {
                      readVvxEffHist(ctx, function () {
                        pollDbg("P D6 DER", function () {
                          deriveCrossFeatures(ctx, function () {
                            pollDbg("P D7 WTM", function () {
                              writeTelemetryM(ctx, function () {
                                pollDbg("P D8 WTA", function () {
                                  writeTelemetryAct(ctx, function () {
                                    pollDbg("P D9 WH", function () {
                                      writeVvxEffRawHist(ctx, function () {
                                        pollDbg("P D10 NUM", function () {
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
