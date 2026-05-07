// prep-dampers base 1.9.0-heat-balance
var SCRIPT_NAME = "prep";
var SCRIPT_ID = 6;

var COMFORT_ENUM_ID = 200;
var TARGET_TEMP_NUMBER_ID = 200;

var IP_VVX = "192.168.77.40";
var KEY_VVX_TEL_M = "ftx.tel.m";
var KEY_WEATHER_DAY_AVG_TEMP_C = "hp.weather.temp.day_avg.c";
var KEY_WEATHER_SOLAR_WM2 = "hp.weather.solar.wm2";
var KEY_PRICE_2H = "hp.price.2h";

var HOUSE_LOSS_KWH_DAY_PER_C = 12.5;
var BASE_INTERNAL_KWH_DAY = 42.0;
var SOLAR_KWH_DAY_PER_WM2 = 0.06;

// Single output KVS for optimizer preparation.
var KEY_PREP_OBJECT = "hp.opt.prep";
