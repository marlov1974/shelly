// poll base 3.5.0-sensor-addon-telemetry
var SCRIPT_NAME = "poll";
var SCRIPT_ID = 4;

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";

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
    supply: {
      pa: 0,
      ls: 0,
      rpm: 0,
      fan_on: 0,
      fan_pct: 0,
      fan_w: 0,
      temp_to_house: 0,
      temp_post_vvx: 0,
      temp_outdoor: 0,
      temp_brine: 0,
      temp_brine_post_shunt: 0,
      temp_hotwater: 0,
      temp_hotwater_post_shunt: 0
    },
    extract: {
      pa: 0,
      ls: 0,
      rpm: 0,
      fan_on: 0,
      fan_pct: 0,
      fan_w: 0,
      temp_to_outdoor: 0
    },
    process: {
      rpm_vvx: 0,
      co2_ppm: 0,
      temp_house: 20.0,
      rh_house: 60
    },
    heat: { on: 0, pct: 0, w: 0 },
    cool: { on: 0, pct: 0, w: 0 },
    vvx: { on: 0, w: 0 },
    dmp: { on: 0, w: 0 }
  };
}
