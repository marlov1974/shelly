// master run 1.7.0-local-driver-canary
function stopWorker(id, cb) {
  if (!id || id === MASTER_ID) {
    cb();
    return;
  }
  Shelly.call("Script.Stop", { id: id }, function () {
    Timer.set(80, false, cb);
  });
}

function startWorker(id, name) {
  log("ST " + name + " #" + id);
  Shelly.call("Script.Start", { id: id }, function (res, err) {
    if (err) log("STE " + name);
  });
}

function decScores() {
  scoreState = scoreState - 1;
  scoreWeather = scoreWeather - 1;
  scoreBrain = scoreBrain - 1;
  scoreVvxExecutor = scoreVvxExecutor - 1;
  scoreReboot = scoreReboot - 1;
}

function chooseBest() {
  var id = REBOOT_ID;
  var name = "reboot";
  var score = scoreReboot;

  if (scoreWeather < score) { id = WEATHER_ID; name = "weather"; score = scoreWeather; }
  if (scoreBrain < score) { id = BRAIN_ID; name = "brain"; score = scoreBrain; }
  if (scoreState < score) { id = STATE_ID; name = "state"; score = scoreState; }
  if (scoreVvxExecutor < score) { id = VVX_EXECUTOR_ID; name = "vvxexec"; score = scoreVvxExecutor; }

  return { id: id, name: name };
}

function resetScore(id) {
  if (id === STATE_ID) scoreState = RESET_STATE;
  else if (id === WEATHER_ID) scoreWeather = RESET_WEATHER;
  else if (id === BRAIN_ID) scoreBrain = RESET_BRAIN;
  else if (id === VVX_EXECUTOR_ID) scoreVvxExecutor = RESET_VVX_EXECUTOR;
  else if (id === REBOOT_ID) scoreReboot = RESET_REBOOT;
}
