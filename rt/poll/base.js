// poll base 3.1.0
var SCRIPT_NAME = "poll";

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";
var POLL_STATUS_TEXT_ID = 202;

function log(s) {
  print(String(SCRIPT_NAME) + " " + s);
}

function n(v, d) {
  var x = Number(v);
  return (x === x) ? x : d;
}

function i(v) {
  var x = Number(v);
  if (x !== x) return 0;
  return Math.floor(x + 0.5);
}

function d1(v) {
  var x = Number(v);
  if (x !== x) return 0;
  return Math.round(x * 10) / 10;
}

function clip(v, lo, hi) {
  var x = Number(v);
  if (x !== x) x = 0;
  if (x < lo) x = lo;
  if (x > hi) x = hi;
  return x;
}

function createPollCtx() {
  return {
    supply: { pa: 0, ls: 0, rpm: 0, fan_on: 0, fan_pct: 0, fan_w: 0, temp_post_vvx: 0, temp_outdoor: 0, temp_to_outdoor: 0 },
    extract: { pa: 0, ls: 0, rpm: 0, fan_on: 0, fan_pct: 0, fan_w: 0, temp_to_house: 0, temp_brine: 0, temp_hotwater: 0 },
    process: { rpm_vvx: 0, co2_ppm: 0, temp_house: 20.0, rh_house: 60 },
    heat: { on: 0, pct: 0, w: 0 },
    cool: { on: 0, pct: 0, w: 0 },
    vvx: { on: 0, w: 0 },
    dmp: { on: 0 }
  };
}
