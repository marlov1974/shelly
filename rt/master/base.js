// master base 1.7.0-local-driver-canary
var SCRIPT_NAME = "master";
var SCRIPT_ID = 3;

var BOOT_ID = 2;
var MASTER_ID = 3;
var STATE_ID = 5;
var WEATHER_ID = 6;
var BRAIN_ID = 7;
var REBOOT_ID = 9;
var VVX_EXECUTOR_ID = 10;

var TICK_MS = 15000;

var RESET_STATE = 4;
var RESET_BRAIN = 4;
var RESET_VVX_EXECUTOR = 5;
var RESET_WEATHER = 240;
var RESET_REBOOT = 5760;

var scoreState = 1;
var scoreWeather = 2;
var scoreBrain = 3;
var scoreVvxExecutor = 4;
var scoreReboot = 5760;

var tickCount = 0;
var lastWorkerId = 0;
var runningTick = 0;

function n(v, d) { var x = Number(v); return (x === x) ? x : d; }
function i(v) { var x = Number(v); if (x !== x) return 0; return Math.floor(x + 0.5); }
