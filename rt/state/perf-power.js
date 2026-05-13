// state perf-power 1.6.2-base-power-contract
var BASE_POWER_ID = 201;
var PRIMARY_POWER_ID = 205;
var BASE_POWER_W = 14;

function calcMeasuredPower(telAct) {
  var sup = telAct && telAct.sup ? telAct.sup : {};
  var ext = telAct && telAct.ext ? telAct.ext : {};
  var vvx = telAct && telAct.vvx ? telAct.vvx : {};
  var heat = telAct && telAct.heat ? telAct.heat : {};
  var cool = telAct && telAct.cool ? telAct.cool : {};
  var dmp = telAct && telAct.dmp ? telAct.dmp : {};
  return i(clip(w(sup) + w(ext) + w(vvx) + w(heat) + w(cool) + w(dmp), 0, 9999));
}

function calcPower(telM, telAct) {
  return i(clip(BASE_POWER_W + calcMeasuredPower(telAct || {}), 0, 9999));
}

function calcPowerFeature(ctx) {
  ctx.base_power_w = BASE_POWER_W;
  ctx.power_w = calcPower(ctx.telM || {}, ctx.telAct || {});
}

function writePowerFeature(ctx, cb) {
  numberSet(BASE_POWER_ID, ctx.base_power_w || BASE_POWER_W, function () {
    numberSet(PRIMARY_POWER_ID, ctx.power_w || 0, cb);
  });
}
