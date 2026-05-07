// optimize-dampers main 1.1.1-compact-prep
function run() {
  readPrep(function (prep) {
    if (!prep || !prep.start_plan || !prep.prices) {
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
