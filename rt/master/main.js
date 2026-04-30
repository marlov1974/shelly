// master main 1.4.0-score-dispatcher
function tick() {
  if (runningTick) {
    log("SKIP");
    return;
  }

  runningTick = 1;
  tickCount = tickCount + 1;

  stopWorker(lastWorkerId, function () {
    var w;
    decScores();
    w = chooseBest();
    resetScore(w.id);
    lastWorkerId = w.id;
    log("T" + tickCount + " " + w.name);
    startWorker(w.id, w.name);
    runningTick = 0;
  });
}

function bootMaster() {
  log("BOT");
  Timer.set(1000, false, tick);
  Timer.set(TICK_MS, true, tick);
}

bootMaster();
