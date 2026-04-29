// driver base 1.0.0
var SCRIPT_NAME = "driver";
var KEY_INTENT_ACT = "ftx.intent.act";

function createDriverCtx() {
  return {
    rawIntent: null,
    intent: null,
    thermalConflict: 0
  };
}
