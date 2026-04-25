// poll feature-heat 1.1.0
var IP_HEAT = "192.168.77.12";

function readHeat(ctx, cb) {
  httpGetStatus(IP_HEAT, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.heat.on = x ? x.on : 0;
    ctx.heat.pct = x ? normPct(x.pct) : 0;
    ctx.heat.w = x ? normW(x.w) : 0;
    cb();
  });
}
