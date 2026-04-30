// poll base 3.3.1-fixed-id
var SCRIPT_NAME = "poll";
var SCRIPT_ID = 4;

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";

var IP_SUPPLY_UNI = "192.168.77.20";
var IP_EXTRACT_UNI = "192.168.77.21";
var IP_PROCESS_UNI = "192.168.77.22";
var IP_SUPPLY_FAN = "192.168.77.10";
var IP_EXTRACT_FAN = "192.168.77.11";
var IP_HEAT = "192.168.77.12";
var IP_COOL = "192.168.77.13";
var IP_VVX = "192.168.77.40";
var IP_DAMPERS = "192.168.77.30";

var K_SUPPLY = 11.6;
var K_EXTRACT = 12.1;

function createPollCtx() {
  return {
    su: null,
    sf: null,
    eu: null,
    ef: null,
    pr: null,
    ht: null,
    cl: null,
    vx: null,
    dm: null,
    telM: null,
    telAct: null
  };
}
