// state base 1.2.0
var SCRIPT_NAME = "state";

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";
var KEY_STATE_RUN = "ftx.state.run";

var STATE_STATUS_TEXT_ID = 202;

function log(s) {
  print(String(SCRIPT_NAME) + " " + s);
}

function createStateCtx() {
  return {
    telM: {},
    telAct: {},
    run: {}
  };
}
