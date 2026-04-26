// brain base 2.0.0-structured
var SCRIPT_NAME = "brain";

var CMD_ENABLE_ID = 200;
var CMD_NIGHT_SETBACK_ID = 201;
var CMD_MODE_ID = 200;
var CMD_HOUSE_TEMP_ID = 200;
var VM_TARGET_TO_HOUSE_ID = 204;

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";
var KEY_INTENT_ACT = "ftx.intent.act";
var KEY_MODE_FORCED_STATE = "ftx.mode_forced_state";
var KEY_WEATHER_ACT = "ftx.weather.act";

var MODE_STD = "STD";
var MODE_BST = "BST";
var MODE_FIRE = "FIRE";
var MODE_MAN = "MAN";

var FAN_START_PCT = 15;
var BST_SUP_PCT = 90;
var BST_EXT_PCT = 90;
var FIRE_SUP_PCT = 75;
var FIRE_EXT_PCT = 25;

var HEAT_DISABLE_ABOVE_OUT_C = 20;
var COOL_DISABLE_BELOW_OUT_C = 15;
var HEAT_ON_DB_C = 0.3;
var HEAT_OFF_DB_C = 0.1;
var COOL_ON_DB_C = 0.3;
var COOL_OFF_DB_C = 0.1;
var HEAT_KP_STEP = 0.5;
var HEAT_HOLD_BAND_C = 0.1;
var HEAT_STEP_MAX_UP_PCT = 8;
var HEAT_STEP_MAX_DOWN_PCT = 8;
var COOL_STEP_PCT = 5;
var COOL_HOLD_BAND_C = 0.1;

var VVX_EFF_THEORY = 0.80;
var VVX_COST_BIAS_FACTOR = 2.0;
var VVX_COST_HOLD_DB_C = 0.2;

var EXT_MIN_PCT = 15;
var EXT_MAX_PCT = 90;
var STD_COOL_CAP_PCT = 75;
var CO2_PPM_AT_25 = 500;
var CO2_PPM_AT_75 = 750;
var CO2_EXT_PCT_AT_25 = 25;
var CO2_EXT_PCT_AT_75 = 75;
var TEMP_ERR_MAX_C = 3.0;
var TEMP_EXT_BASE_PCT = 15;
var TEMP_EXT_SLOPE_PCT_PER_C = 20;

var FREEZE_POST_VVX_MIN_C = 0.0;
var FAILSAFE_WRONG_DIR_DB_C = 1.0;
var FAILSAFE_COLD_EXT_PCT = 15;
var FAILSAFE_MILD_EXT_PCT = 25;

var NIGHT_SETBACK_DELTA_C = 1.0;
var NIGHT_SETBACK_START_HOUR = 19;
var NIGHT_SETBACK_END_HOUR = 4;
var WEATHER_BIAS_START_HOUR = 4;
var WEATHER_BIAS_END_HOUR = 19;
var WEATHER_SOLAR_NEUTRAL_KWH = 15;
var WEATHER_TEMP_NEUTRAL_C = 5;
var WEATHER_SOLAR_SLOPE_C_PER_KWH = 0.04;
var WEATHER_TEMP_WARM_SLOPE_C_PER_C = 0.10;
var WEATHER_TEMP_COLD_SLOPE_C_PER_C = 0.10;
var WEATHER_BIAS_MIN_C = -3.0;
var WEATHER_BIAS_MAX_C = 1.5;

var FORCED_MODE_MAX_CYCLES = 240;
var DP_A = 17.62;
var DP_B = 243.12;

function log(s) { print("[brain] " + String(s || "")); }

function findScriptByName(arr, name) {
  var i;
  for (i = 0; i < arr.length; i++) if (arr[i].name === name) return arr[i];
  return null;
}

function selfStop() {
  Shelly.call("Script.List", {}, function (res, err) {
    var s;
    if (err || !res || !res.scripts) return;
    s = findScriptByName(res.scripts, SCRIPT_NAME);
    if (!s || s.id === undefined) return;
    Shelly.call("Script.Stop", { id: s.id }, function () {});
  });
}

function createBrainCtx() {
  return {
    cmd: { enable: 0, night_setback: 0, mode: MODE_STD, house_temp_c: 21.0 },
    telM: {},
    telAct: {},
    weather: { solar_kwh_today: 0, temp_now_c: 0 },
    forced: { mode: MODE_STD, cycles: 0 },
    inp: { t_out_c: 21.0, t_house_c: 21.0, t_to_house_c: 21.0, t_post_vvx_c: 21.0, rh_house_pct: 50.0, ppm_house: 500.0, dmp_run: 0, sup_run: 0, ext_run: 0, vvx_on_actual: 0, heat_pct_actual: 0, cool_pct_actual: 0 },
    dx: {},
    intent: null
  };
}
