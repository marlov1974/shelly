// state perf-power 1.6.0-primary-power-component
var TOTAL_POWER_ID = 201;
var PRIMARY_POWER_ID = 205;
var IDLE_POWER_W = 14;

function calcPower(telM, telAct) {
  var sup = telAct && telAct.sup ? telAct.sup : {};
  var ext = telAct && telAct.ext ? telAct.ext : {};
  var vvx = telAct && telAct.vvx ? telAct.vvx : {};
  var heat = telAct && telAct.heat ? telAct.heat : {};
  var cool = telAct && telAct.cool ? telAct.cool : {};
  var dmp = telAct && telAct.dmp ? telAct.dmp : {};
  var total = IDLE_POWER_W + w(sup) + w(ext) + w(vvx) + w(heat) + w(cool) + w(dmp);
  return i(clip(total, 0, 9999));
}

function calcPowerFeature(ctx) {
  ctx.power_w = calcPower(ctx.telM || {}, ctx.telAct || {});
}

function writePowerFeature(ctx, cb) {
  var p = ctx.power_w || 0;
  numberSet(TOTAL_POWER_ID, p, function () {
    numberSet(PRIMARY_POWER_ID, p, cb);
  });
}
