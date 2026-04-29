// master base 1.2.0-slotted-60s
var SCRIPT_NAME = "master";

var INSTALLER_ID = 1;
var MASTER_ID = 2;

var TICK_MS = 60000;
var CLEANUP_AT_MS = 50000;

var WEATHER_EVERY_TICKS = 60;
var INSTALL_EVERY_TICKS = 5;

var TIMEOUT_POLL_MS = 10000;
var TIMEOUT_STATE_MS = 5000;
var TIMEOUT_WEATHER_MS = 15000;
var TIMEOUT_INSTALLER_MS = 15000;
var TIMEOUT_BRAIN_MS = 10000;
var TIMEOUT_DRIVER_MS = 15000;

var tickCount = 0;
var cycleRunning = 0;
var cycleStartMs = 0;
