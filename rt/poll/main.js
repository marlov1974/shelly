// poll main 1.0.0
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

