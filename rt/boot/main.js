// boot main 1.0.0-stabilize-then-master
function startMasterAndStop() {
  log("ST master #" + MASTER_ID);
  Shelly.call("Script.Start", { id: MASTER_ID }, function () {
    selfStop();
  });
}

function boot() {
  log("BOT");
  log("WAIT 60");
  Timer.set(BOOT_DELAY_MS, false, startMasterAndStop);
}

boot();
