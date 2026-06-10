// master base 1.5.0-no-installer
var SCRIPT_NAME = "master";
var SCRIPT_ID = 3;

var BOOT_ID = 2;
var MASTER_ID = 3;
var POLL_ID = 4;
var STATE_ID = 5;
var WEATHER_ID = 6;
var BRAIN_ID = 7;
var DRIVER_ID = 8;
var REBOOT_ID = 9;

var TICK_MS = 15000;

var RESET_POLL = 4;
var RESET_STATE = 4;
var RESET_BRAIN = 4;
var RESET_DRIVER = 4;
var RESET_WEATHER = 240;
var RESET_REBOOT = 5760;

var scorePoll = 1;
var scoreState = 2;
var scoreWeather = 3;
var scoreBrain = 4;
var scoreDriver = 5;
var scoreReboot = 5760;

var tickCount = 0;
var lastWorkerId = 0;
var runningTick = 0;

function n(v, d) { var x = Number(v); return (x === x) ? x : d; }
function i(v) { var x = Number(v); if (x !== x) return 0; return Math.floor(x + 0.5); }
