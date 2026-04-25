// poll main 1.0.1
function runPoll() {
  log("BOT");
  runGroup1(function () {
    runGroup2(function () {
      readVvxEffRawHist(function () {
        derive(function () {
          writeTelemetryM(function () {
            writeTelemetryAct(function () {
              writeVvxEffRawHist(function () {
                writeTotalPower(function () {
                  writeVvxEfficiency(function () {
                    writeFanSpeedAvg(function () {
                      writePollStatus(function () {
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
}

runPoll();

