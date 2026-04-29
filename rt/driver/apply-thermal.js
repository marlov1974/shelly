// driver apply-thermal 1.0.0
var IP_HEAT = "192.168.77.12";
var IP_COOL = "192.168.77.13";
var THERMAL_LIGHT_ID = 0;

function applyOneThermal(ip, act, cb) {
  var aOn = act && act.on ? 1 : 0;
  var p = aOn ? clipPct(act.pct) : 0;
  remoteLightSet(ip, THERMAL_LIGHT_ID, p > 0, p, cb);
}

function applyThermalIntent(ctx, cb) {
  if (ctx.thermalConflict) log("THERM CONFLICT");
  applyOneThermal(IP_HEAT, ctx.intent.heat, function () {
    applyOneThermal(IP_COOL, ctx.intent.cool, cb);
  });
}

function applyThermalOff(ctx, cb) {
  remoteLightSet(IP_HEAT, THERMAL_LIGHT_ID, 0, 0, function () {
    remoteLightSet(IP_COOL, THERMAL_LIGHT_ID, 0, 0, cb);
  });
}
