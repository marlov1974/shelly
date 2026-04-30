// driver base 1.0.1-fixed-id
var SCRIPT_NAME = "driver";
var SCRIPT_ID = 8;
var KEY_INTENT_ACT = "ftx.intent.act";

function createDriverCtx() {
  return {
    rawIntent: null,
    intent: null,
    thermalConflict: 0
  };
}
