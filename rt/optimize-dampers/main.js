// optimize-dampers main 1.0.0
function run() {
  readPrep(function (prep) {
    if (!prep || !prep.levels || !prep.start_plan) {
      log("NO PREP");
      selfStop();
      return;
    }
    writePlan(optimize(prep), function () {
      selfStop();
    });
  });
}

run();
