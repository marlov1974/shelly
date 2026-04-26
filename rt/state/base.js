// state base 1.2.13
var SCRIPT_NAME = "state";

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";
var KEY_STATE_RUN = "ftx.state.run";

var STATE_STATUS_TEXT_ID = 203;

function log(s) {
  print(String(SCRIPT_NAME) + " " + s);
}

function createStateCtx() {
  return {
    telM: {},
    telAct: {},
    run: {
      sup: 0,
      ext: 0,
      vvx: 0,
      heat: 0,
      cool: 0,
      dmp: 0
    }
  };
}
