// master run 1.6.0-no-poll
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
  scoreDriver = scoreDriver - 1;
  scoreReboot = scoreReboot - 1;
}

function chooseBest() {
  var id = REBOOT_ID;
  var name = "reboot";
  var score = scoreReboot;

  if (scoreWeather < score) { id = WEATHER_ID; name = "weather"; score = scoreWeather; }
  if (scoreDriver < score) { id = DRIVER_ID; name = "driver"; score = scoreDriver; }
  if (scoreBrain < score) { id = BRAIN_ID; name = "brain"; score = scoreBrain; }
  if (scoreState < score) { id = STATE_ID; name = "state"; score = scoreState; }

  return { id: id, name: name };
}

function resetScore(id) {
  if (id === STATE_ID) scoreState = RESET_STATE;
  else if (id === WEATHER_ID) scoreWeather = RESET_WEATHER;
  else if (id === BRAIN_ID) scoreBrain = RESET_BRAIN;
  else if (id === DRIVER_ID) scoreDriver = RESET_DRIVER;
  else if (id === REBOOT_ID) scoreReboot = RESET_REBOOT;
}
