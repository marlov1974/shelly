// master_extract_fan_v0_1_0
var PUBLISHER_ID = 2;
var EXECUTOR_ID = 3;
var EXEC_MS = 43000;
var PUBLISHER_MS = 607000;

function log(m) { print(String(m)); }
function startScript(id, tag) {
  Shelly.call("Script.Start", { id: id }, function (res, err) {
    if (err) log("LM ext sterr " + tag);
  });
}
function restartPublisher() {
  Shelly.call("Script.Stop", { id: PUBLISHER_ID }, function () {
    Timer.set(300, false, function () { startScript(PUBLISHER_ID, "pub"); });
  });
}
function runExecutor() { startScript(EXECUTOR_ID, "exec"); }
Timer.set(4000, false, restartPublisher);
Timer.set(9000, false, runExecutor);
Timer.set(PUBLISHER_MS, true, restartPublisher);
Timer.set(EXEC_MS, true, runExecutor);
log("LM ext boot");
