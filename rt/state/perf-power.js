// state perf-power 1.3.0-classic-calc-rpc-write
var TOTAL_POWER_ID = 201;
var IDLE_POWER_W = 14;
var DAMPERS_POWER_W = 8;

function calcPower(telM, telAct) {
  var sup = telAct && telAct.sup ? telAct.sup : {};
  var ext = telAct && telAct.ext ? telAct.ext : {};
  var vvx = telAct && telAct.vvx ? telAct.vvx : {};
  var heat = telAct && telAct.heat ? telAct.heat : {};
  var cool = telAct && telAct.cool ? telAct.cool : {};
  var dmp = telAct && telAct.dmp ? telAct.dmp : {};
  var total = IDLE_POWER_W + (on(dmp) ? DAMPERS_POWER_W : 0) + w(sup) + w(ext) + w(vvx) + w(heat) + w(cool);
  return i(clip(total, 0, 9999));
}

function calcPowerFeature(ctx) {
  ctx.power_w = calcPower(ctx.telM || {}, ctx.telAct || {});
}

function writePowerFeature(ctx, cb) {
  numberSet(TOTAL_POWER_ID, ctx.power_w || 0, cb);
}
