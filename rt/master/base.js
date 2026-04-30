// master base 1.4.0-score-dispatcher
var SCRIPT_NAME = "master";
var SCRIPT_ID = 3;

var INSTALLER_ID = 1;
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
var RESET_INSTALLER = 20;
var RESET_WEATHER = 240;
var RESET_REBOOT = 5760;

var scoreInstaller = 1;
var scorePoll = 2;
var scoreState = 3;
var scoreWeather = 4;
var scoreBrain = 5;
var scoreDriver = 6;
var scoreReboot = 5760;

var tickCount = 0;
var lastWorkerId = 0;
var runningTick = 0;

function n(v, d) { var x = Number(v); return (x === x) ? x : d; }
function i(v) { var x = Number(v); if (x !== x) return 0; return Math.floor(x + 0.5); }
