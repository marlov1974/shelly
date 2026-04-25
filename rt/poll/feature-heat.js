// poll feature-heat 1.0.1
var IP_HEAT = "192.168.77.12";
var HEAT_MAX_W = 50;

function readHeat(ctx, cb) {
  httpGetStatus(IP_HEAT, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.heat.on = x ? x.on : 0;
    ctx.heat.pct = x ? clipPct(x.pct) : 0;
    ctx.heat.w = x ? clipW(x.w, HEAT_MAX_W) : 0;
    cb();
  });
}
